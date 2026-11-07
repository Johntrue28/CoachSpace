// Sessions are generated from each group's weekly slots (src/data/groups.ts), so the
// calendar always shows real dates around today. Dates are local "YYYY-MM-DD" strings;
// date arithmetic is done in UTC so daylight-saving changes never shift a day.
import type { AttendanceRecord, OneOffSession, ScheduleChanges, Session, SessionOverride, WeeklySlot } from "./types";
import { groupById, groups, participantsOf } from "./groups";
import { tennis } from "./scenarios/tennis";
import type { ScenarioData, TopicRotation } from "./scenarios/types";

/**
 * Session topics per group of the active scenario, used in rotation session after session.
 * `from` is the date of a session that uses the first topic, chosen to match the scenario's
 * fictional chat messages.
 */
let topics: Record<string, TopicRotation> = tennis.sessionTopics;

/** Points the topics at another scenario. Called by src/data/scenario.ts only. */
export function setSessionTopics(data: ScenarioData) {
  topics = data.sessionTopics;
}

/** Position of a group's session in its rotation, counted from the `from` session. */
function sessionNumber(slots: WeeklySlot[], date: string, slotIndex: number, from: string) {
  const fromSlot = Math.max(0, slots.findIndex((s) => s.weekday === weekdayOf(from)));
  return (weekIndex(date) - weekIndex(from)) * slots.length + slotIndex - fromSlot;
}

const DAY_MS = 86_400_000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string | undefined): value is string {
  return Boolean(value && DATE_KEY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)));
}

/** Local date of a Date object, as "YYYY-MM-DD". */
export function toDateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayNumber(key: string) {
  return Date.parse(`${key}T00:00:00Z`) / DAY_MS;
}

function fromDayNumber(n: number) {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

export function addDays(key: string, days: number) {
  return fromDayNumber(dayNumber(key) + days);
}

/** 1 = Monday … 7 = Sunday. 1 January 1970 was a Thursday. */
export function weekdayOf(key: string) {
  return ((((dayNumber(key) + 3) % 7) + 7) % 7) + 1;
}

/** "YYYY-MM" of a date key. */
export function monthOf(key: string) {
  return key.slice(0, 7);
}

export function isMonthKey(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

/** The month `n` months after `month` ("YYYY-MM"). */
export function addMonths(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const index = y * 12 + (m - 1) + n;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** The weeks (Monday to Sunday) that cover a month, as date keys, including days of the
 * previous and next months needed to fill the first and last week. */
export function monthGrid(month: string): string[][] {
  const first = `${month}-01`;
  const lastDay = addDays(`${addMonths(month, 1)}-01`, -1);
  const weeks: string[][] = [];
  for (let start = weekStart(first); start <= lastDay; start = addDays(start, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
  }
  return weeks;
}

/** The Monday of the week that contains `key`. */
export function weekStart(key: string) {
  return addDays(key, 1 - weekdayOf(key));
}

function weekIndex(key: string) {
  return Math.floor((dayNumber(key) + 3) / 7);
}

export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (((h * 60 + m + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Minutes between two 24-hour times on the same day. */
export function minutesBetween(start: string, end: string) {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  return toMin(end) - toMin(start);
}

/** No calendar changes: only the weekly schedule. */
export const NO_CHANGES: ScheduleChanges = { overrides: {}, oneOffs: [] };

const RECURRING_ID = /^(.+)-(\d{4}-\d{2}-\d{2})$/;

export function isOneOffId(id: string) {
  return id.startsWith("oo-");
}

/** The sessions generated from the weekly slots on one date, before any change. */
function generatedOn(date: string, groupId?: string): Session[] {
  const weekday = weekdayOf(date);
  return groups
    .filter((g) => (!groupId || g.id === groupId) && (!g.startsOn || date >= g.startsOn))
    .flatMap((g) =>
      g.slots.flatMap((slot, i): Session[] => {
        if (slot.weekday !== weekday) return [];
        const rotation = topics[g.id] ?? { from: date, list: ["Training session"] };
        const n = sessionNumber(g.slots, date, i, rotation.from);
        const list = rotation.list;
        return [
          {
            id: `${g.id}-${date}`,
            groupId: g.id,
            title: list[((n % list.length) + list.length) % list.length],
            date,
            time: slot.time,
            endTime: addMinutes(slot.time, slot.durationMin),
            place: g.venue,
            kind: "recurring",
            status: "scheduled",
          },
        ];
      }),
    );
}

/** A recurring session as the weekly schedule defines it, ignoring changes. */
export function regularSession(id: string) {
  const match = RECURRING_ID.exec(id);
  if (!match || !groupById(match[1]) || !isDateKey(match[2])) return undefined;
  return generatedOn(match[2], match[1]).find((s) => s.id === id);
}

function withOverride(base: Session, o: SessionOverride | undefined): Session {
  if (!o) return base;
  const s: Session = {
    ...base,
    date: o.date ?? base.date,
    time: o.time ?? base.time,
    endTime: o.endTime ?? base.endTime,
    place: o.place ?? base.place,
    title: o.title ?? base.title,
    status: o.cancelled ? "cancelled" : "scheduled",
    cancelReason: o.cancelled ? o.cancelReason : undefined,
  };
  if (s.date !== base.date || s.time !== base.time) s.movedFrom = { date: base.date, time: base.time };
  if (s.place !== base.place) s.placeChanged = true;
  return s;
}

function fromOneOff(o: OneOffSession): Session {
  const venue = groupById(o.groupId)?.venue;
  return {
    id: o.id,
    groupId: o.groupId,
    title: o.title,
    date: o.date,
    time: o.time,
    endTime: o.endTime,
    place: o.place,
    kind: "one-off",
    status: o.cancelled ? "cancelled" : "scheduled",
    cancelReason: o.cancelled ? o.cancelReason : undefined,
    placeChanged: venue !== undefined && o.place !== venue ? true : undefined,
  };
}

/** Finds a session by id, with the coach's changes applied. */
export function sessionById(id: string, changes: ScheduleChanges = NO_CHANGES): Session | undefined {
  if (isOneOffId(id)) {
    const o = changes.oneOffs.find((x) => x.id === id);
    return o && groupById(o.groupId) ? fromOneOff(o) : undefined;
  }
  const base = regularSession(id);
  return base && withOverride(base, changes.overrides[id]);
}

/** All sessions on one date (cancelled ones included, marked as such), earliest first. */
export function sessionsOn(date: string, changes: ScheduleChanges = NO_CHANGES, groupId?: string): Session[] {
  // Regular sessions of this date that were not moved elsewhere.
  const regular = generatedOn(date, groupId)
    .map((s) => withOverride(s, changes.overrides[s.id]))
    .filter((s) => s.date === date);
  // Sessions moved here from another date.
  const movedIn = Object.entries(changes.overrides)
    .filter(([id, o]) => o.date === date && RECURRING_ID.exec(id)?.[2] !== date)
    .map(([id]) => sessionById(id, changes))
    .filter((s): s is Session => Boolean(s && (!groupId || s.groupId === groupId)));
  const oneOffs = changes.oneOffs
    .filter((o) => o.date === date && (!groupId || o.groupId === groupId) && groupById(o.groupId))
    .map(fromOneOff);
  return [...regular, ...movedIn, ...oneOffs].sort((a, b) => a.time.localeCompare(b.time));
}

type SessionFilter = { changes?: ScheduleChanges; groupIds?: string[] };

/** Local start time of a session as a Date. */
export function sessionStart(s: Pick<Session, "date" | "time">) {
  const [y, mo, d] = s.date.split("-").map(Number);
  const [h, mi] = s.time.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi);
}

/**
 * Sessions that have not started yet, from `now` onwards (looks ahead two weeks).
 * Cancelled sessions are included, marked as cancelled, unless `activeOnly` is set.
 */
export function upcomingSessions(
  now: Date,
  {
    limit = 4,
    groupId,
    groupIds,
    changes = NO_CHANGES,
    activeOnly = false,
  }: { limit?: number; groupId?: string; activeOnly?: boolean } & SessionFilter = {},
) {
  const today = toDateKey(now);
  const result: Session[] = [];
  for (let i = 0; i < 14 && result.length < limit; i++) {
    for (const s of sessionsOn(addDays(today, i), changes, groupId)) {
      if (groupIds && !groupIds.includes(s.groupId)) continue;
      if (activeOnly && s.status === "cancelled") continue;
      if (sessionStart(s) >= now && result.length < limit) result.push(s);
    }
  }
  return result;
}

/** Present and absent counts of an attendance record, for its group's current participants. */
export function attendanceSummary(record: AttendanceRecord) {
  const members = participantsOf(record.groupId);
  const present = members.filter((p) => record.marks[p.id] === "present").length;
  const absent = members.filter((p) => record.marks[p.id] === "absent").length;
  return { present, absent, total: members.length };
}

export type SessionState = "regular" | "extra" | "changed" | "cancelled";

/**
 * What the calendar colours a session by (D-045): cancelled, changed (moved or a new place),
 * an extra one-off session, or a regular one. Cancelled wins over every other state.
 */
export function sessionState(s: Pick<Session, "status" | "kind" | "movedFrom" | "placeChanged">): SessionState {
  if (s.status === "cancelled") return "cancelled";
  if (s.movedFrom || (s.placeChanged && s.kind === "recurring")) return "changed";
  if (s.kind === "one-off") return "extra";
  return "regular";
}
