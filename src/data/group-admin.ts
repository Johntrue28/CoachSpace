// Group management in the demo (D-072, redesign step R7): create and edit a group, add members and
// show a fictional invite link — the "create team → invite" flow coaches know from PlayerPlus/TeamPlus.
// Pure functions, no React (unit tested). The changes are kept on top of the active scenario's
// fictional groups and saved in this browser only, per scenario (src/data/store.tsx). Nobody is
// invited and no link works: a real invitation needs accounts and a backend (not in Phase 1).

import type { Discipline, Group, Participant, WeeklySlot } from "./types";
import { t } from "@/i18n";

/** Changes to a scenario's group: everything the group form edits. */
export type GroupEdit = Pick<Group, "name" | "discipline" | "slots" | "venue"> & { short?: string };

/** Every group change made in this browser, on top of the scenario's fictional data. */
export type GroupChanges = {
  /** Groups created in the demo. Their sessions start on `startsOn`. */
  created: Group[];
  /** Scenario groups edited in the demo, by group id. */
  edited: Record<string, GroupEdit>;
  /** Memberships added in the demo (new members of any group). */
  members: Participant[];
};

export const NO_GROUP_CHANGES: GroupChanges = { created: [], edited: {}, members: [] };

/** What the group form edits. */
export type GroupDraft = {
  name: string;
  discipline: Discipline;
  slots: WeeklySlot[];
  venue: string;
  /** Optional short code for tight spaces, e.g. "U12". */
  short: string;
};

export type GroupDraftErrors = {
  name?: string;
  discipline?: string;
  /** About the weekly schedule as a whole (none, too many). */
  slots?: string;
  /** One message per slot, in the same order as `draft.slots`. */
  slot?: (string | undefined)[];
  venue?: string;
  short?: string;
};

export const MAX_SLOTS = 4;
export const NAME_MAX = 40;
export const VENUE_MAX = 60;
export const SHORT_MAX = 5;
export const DURATION_MIN = 15;
export const DURATION_MAX = 240;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const SHORT = /^[A-Za-z0-9]+$/;

/** The name of a weekday, 1 = Monday … 7 = Sunday, in the interface language. */
export function weekdayName(weekday: number) {
  return t("weekday.long").split(",")[weekday - 1];
}

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** An empty form for a new group: one weekly session on Monday at 18:00 for an hour. */
export function emptyDraft(discipline: Discipline): GroupDraft {
  return { name: "", discipline, slots: [{ weekday: 1, time: "18:00", durationMin: 60 }], venue: "", short: "" };
}

/** The form filled in from an existing group. */
export function draftFromGroup(group: Group): GroupDraft {
  return {
    name: group.name,
    discipline: group.discipline,
    slots: group.slots.map((s) => ({ ...s })),
    venue: group.venue,
    short: group.short ?? "",
  };
}

/** A slot added with "Add a day": the first free weekday, at the time and length of the last slot. */
export function nextSlot(slots: WeeklySlot[]): WeeklySlot {
  const used = new Set(slots.map((s) => s.weekday));
  const weekday = [1, 2, 3, 4, 5, 6, 7].find((d) => !used.has(d)) ?? 1;
  const last = slots[slots.length - 1];
  return { weekday, time: last?.time ?? "18:00", durationMin: last?.durationMin ?? 60 };
}

/**
 * Checks the group form. `others` are the groups the draft must not clash with (every group except
 * the one being edited); `disciplines` the sports this demo scenario offers. Empty when valid.
 */
export function validateGroupDraft(draft: GroupDraft, others: Group[], disciplines: Discipline[]): GroupDraftErrors {
  const errors: GroupDraftErrors = {};
  const name = draft.name.trim();
  if (name.length < 2) errors.name = t("groupForm.errorName");
  else if (name.length > NAME_MAX) errors.name = t("groupForm.errorNameLong", { max: NAME_MAX });
  else if (others.some((g) => g.name.trim().toLowerCase() === name.toLowerCase())) errors.name = t("groupForm.errorNameTaken");

  if (!disciplines.includes(draft.discipline)) errors.discipline = t("groupForm.errorSport");

  if (draft.slots.length === 0) errors.slots = t("groupForm.errorNoSlots");
  else if (draft.slots.length > MAX_SLOTS) errors.slots = t("groupForm.errorTooMany", { max: MAX_SLOTS });
  const seen = new Set<number>();
  const slot = draft.slots.map((s) => {
    if (!Number.isInteger(s.weekday) || s.weekday < 1 || s.weekday > 7) return t("groupForm.errorDay");
    if (seen.has(s.weekday)) return t("groupForm.errorSameDay", { day: weekdayName(s.weekday) });
    seen.add(s.weekday);
    if (!TIME.test(s.time)) return t("groupForm.errorTime");
    if (!Number.isInteger(s.durationMin) || s.durationMin < DURATION_MIN || s.durationMin > DURATION_MAX) {
      return t("groupForm.errorDuration", { min: DURATION_MIN, max: DURATION_MAX });
    }
    if (toMinutes(s.time) + s.durationMin > 24 * 60) return "The session must end on the same day.";
    return undefined;
  });
  if (slot.some(Boolean)) errors.slot = slot;

  const venue = draft.venue.trim();
  if (!venue) errors.venue = t("groupForm.errorVenue");
  else if (venue.length > VENUE_MAX) errors.venue = t("groupForm.errorVenueLong", { max: VENUE_MAX });

  const short = draft.short.trim();
  if (short) {
    if (!SHORT.test(short)) errors.short = t("groupForm.errorShort");
    else if (short.length > SHORT_MAX) errors.short = t("groupForm.errorShortLong", { max: SHORT_MAX });
    else if (others.some((g) => g.short?.toLowerCase() === short.toLowerCase())) errors.short = t("groupForm.errorShortTaken");
  }
  return errors;
}

export function hasErrors(errors: GroupDraftErrors) {
  return Object.keys(errors).length > 0;
}

/** Slots in weekday order, so "Mon & Wed" always reads the same way. */
function sortedSlots(slots: WeeklySlot[]) {
  return [...slots].sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time)).map((s) => ({ ...s }));
}

function cleanEdit(draft: GroupDraft): GroupEdit {
  const short = draft.short.trim().toUpperCase();
  return {
    name: draft.name.trim(),
    discipline: draft.discipline,
    slots: sortedSlots(draft.slots),
    venue: draft.venue.trim(),
    ...(short ? { short } : {}),
  };
}

/** The next free id with a prefix: "ng-1", "ng-2"… Never reuses an id, even of another kind. */
export function nextId(prefix: string, existing: Iterable<string>) {
  let max = 0;
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  for (const id of existing) {
    const n = Number(pattern.exec(id)?.[1] ?? 0);
    if (n > max) max = n;
  }
  return `${prefix}-${max + 1}`;
}

/** Adds a group. Its sessions start on `today` (no empty registers for weeks before it existed). */
export function createGroup(changes: GroupChanges, draft: GroupDraft, { id, today }: { id: string; today: string }) {
  const group: Group = { id, description: "", startsOn: today, ...cleanEdit(draft) };
  return { changes: { ...changes, created: [...changes.created, group] }, group };
}

/** Saves the form for an existing group: a created group is replaced, a scenario group gets an edit. */
export function editGroup(changes: GroupChanges, id: string, draft: GroupDraft): GroupChanges {
  const edit = cleanEdit(draft);
  if (changes.created.some((g) => g.id === id)) {
    return {
      ...changes,
      created: changes.created.map((g) => {
        if (g.id !== id) return g;
        const { short: _old, ...rest } = g;
        void _old;
        return { ...rest, ...edit };
      }),
    };
  }
  return { ...changes, edited: { ...changes.edited, [id]: edit } };
}

/** What the "Add member" form edits. The guardian is optional (youth groups). */
export type MemberDraft = { name: string; guardian: string };
export type MemberDraftErrors = { name?: string; guardian?: string };

/** Checks a new member. `current` are the group's members now. */
export function validateMemberDraft(draft: MemberDraft, current: Participant[]): MemberDraftErrors {
  const errors: MemberDraftErrors = {};
  const name = draft.name.trim();
  if (name.length < 2) errors.name = t("member.errorName");
  else if (name.length > NAME_MAX) errors.name = t("member.errorNameLong", { max: NAME_MAX });
  else if (current.some((p) => p.name.trim().toLowerCase() === name.toLowerCase())) errors.name = t("member.errorDuplicate");
  const guardian = draft.guardian.trim();
  if (guardian.length === 1) errors.guardian = t("member.errorGuardian");
  else if (guardian.length > NAME_MAX) errors.guardian = t("member.errorNameLong", { max: NAME_MAX });
  return errors;
}

/** "Nov 2026", as the scenarios write when someone joined. */
export function joinedLabel(today: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(today.slice(5, 7)) - 1]} ${today.slice(0, 4)}`;
}

/** Adds a member to a group. */
export function addMember(
  changes: GroupChanges,
  groupId: string,
  draft: MemberDraft,
  { id, today }: { id: string; today: string },
) {
  const guardian = draft.guardian.trim();
  const member: Participant = {
    id,
    groupId,
    name: draft.name.trim(),
    detail: "New member",
    joined: joinedLabel(today),
    ...(guardian ? { guardian } : {}),
  };
  return { changes: { ...changes, members: [...changes.members, member] }, member };
}

/**
 * The groups and participants the app shows: the scenario's, with edits applied, then the groups
 * created in the demo; memberships of groups that no longer exist are left out.
 */
export function applyGroupChanges(baseGroups: Group[], baseParticipants: Participant[], changes: GroupChanges) {
  const groups = [
    ...baseGroups.map((g) => {
      const edit = changes.edited[g.id];
      if (!edit) return g;
      const { short: _old, ...rest } = g;
      void _old;
      return { ...rest, ...edit };
    }),
    ...changes.created.filter((g) => !baseGroups.some((b) => b.id === g.id)),
  ];
  const ids = new Set(groups.map((g) => g.id));
  const participants = [...baseParticipants, ...changes.members.filter((m) => ids.has(m.groupId))];
  return { groups, participants };
}

export function isEmptyGroupChanges(changes: GroupChanges) {
  return changes.created.length === 0 && Object.keys(changes.edited).length === 0 && changes.members.length === 0;
}

/** A stable number for a text (FNV-1a), for codes and the QR placeholder. */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A short, stable text that changes whenever the group changes do (used to show them at once). */
export function groupChangesKey(changes: GroupChanges) {
  return isEmptyGroupChanges(changes) ? "scenario" : hash(JSON.stringify(changes)).toString(36);
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A fictional invite code for a group, the same on every visit: "u16-7kq2". */
export function inviteCode(group: Pick<Group, "id" | "name" | "short">) {
  const base = group.short || group.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 6) || "group";
  let h = hash(`${group.id}:${group.name}`);
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[h % CODE_CHARS.length];
    h = Math.floor(h / CODE_CHARS.length);
  }
  return `${base}-${suffix}`.toLowerCase();
}

/** The fictional invite link shown in the demo. It does not work: there is no sign-up yet. */
export function inviteLink(group: Pick<Group, "id" | "name" | "short">) {
  return `https://coachspace.app/join/${inviteCode(group)}`;
}

export const QR_SIZE = 21;

/**
 * The squares of a QR-like picture for a text: the three corner markers and a stable pattern in
 * between. It only looks like a QR code: it encodes nothing and cannot be scanned (demo placeholder).
 */
export function qrPlaceholder(text: string, size = QR_SIZE): boolean[][] {
  const marker = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    const corners: [number, number][] = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ];
    for (const [r0, c0] of corners) {
      if (inBox(r0, c0)) {
        const dr = r - r0;
        const dc = c - c0;
        const ring = Math.min(dr, dc, 6 - dr, 6 - dc);
        return ring !== 1;
      }
      // The light border around each marker.
      if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return false;
    }
    return undefined;
  };
  let seed = hash(text) || 1;
  const rows: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // xorshift: a stable pseudo-random sequence from the text.
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      seed >>>= 0;
      row.push(marker(r, c) ?? seed % 2 === 0);
    }
    rows.push(row);
  }
  return rows;
}

// Checks for changes read back from this browser (D-069): malformed entries are left out.
type Entry = Record<string, unknown>;
const isEntry = (v: unknown): v is Entry => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";
const isSlot = (v: unknown) =>
  isEntry(v) && Number.isInteger(v.weekday) && isString(v.time) && TIME.test(v.time) && Number.isInteger(v.durationMin) && (v.durationMin as number) > 0;
const isEdit = (v: unknown): v is GroupEdit =>
  isEntry(v) &&
  isString(v.name) &&
  isString(v.discipline) &&
  Array.isArray(v.slots) &&
  v.slots.length > 0 &&
  v.slots.every(isSlot) &&
  isString(v.venue) &&
  (v.short === undefined || isString(v.short));
const isCreated = (v: unknown): v is Group =>
  isEdit(v) && isString((v as Entry).id) && isString((v as Entry).description) && ((v as Entry).startsOn === undefined || isString((v as Entry).startsOn));
const isMember = (v: unknown): v is Participant =>
  isEntry(v) &&
  isString(v.id) &&
  isString(v.groupId) &&
  isString(v.name) &&
  isString(v.detail) &&
  isString(v.joined) &&
  (v.guardian === undefined || isString(v.guardian));

/** Saved group changes with anything malformed left out; no changes when the value is unusable. */
export function normaliseGroupChanges(value: unknown): GroupChanges {
  if (!isEntry(value)) return NO_GROUP_CHANGES;
  const created = Array.isArray(value.created) ? value.created.filter(isCreated) : [];
  const edited = isEntry(value.edited) ? Object.fromEntries(Object.entries(value.edited).filter(([, e]) => isEdit(e))) : {};
  const members = Array.isArray(value.members) ? value.members.filter(isMember) : [];
  return { created, edited: edited as Record<string, GroupEdit>, members };
}
