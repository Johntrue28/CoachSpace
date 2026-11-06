// Answers to "Are you coming?" for each session (D-071): the core loop of team apps such as
// PlayerPlus/TeamPlus, Teamy and Spond. A member answers going, maybe or not going; the coach sees
// the count before the session and the register starts from the answers.
// Pure functions, no React (unit tested). In the demo the answers of the fictional members are
// seeded deterministically; answers given in this browser are kept as changes on top of the seed.

import type { AttendanceMark, Session } from "./types";
import { sessionStart } from "./calendar";
import { rosterFor } from "./attendance";

export type RsvpAnswer = "going" | "maybe" | "not-going";

/** One session's answers: participant id → answer. A member without an entry has not replied. */
export type RsvpAnswers = Record<string, RsvpAnswer>;

/**
 * Answers given in this browser, by session id. `null` removes a seeded answer ("no reply"), so a
 * visitor can also take an answer back.
 */
export type RsvpChanges = Record<string, Record<string, RsvpAnswer | null>>;

export const RSVP_ANSWERS: RsvpAnswer[] = ["going", "maybe", "not-going"];

export function isRsvpAnswer(value: unknown): value is RsvpAnswer {
  return value === "going" || value === "maybe" || value === "not-going";
}

/** Labels as a member sees them on their own buttons. */
export const RSVP_LABEL: Record<RsvpAnswer, string> = { going: "Going", maybe: "Maybe", "not-going": "Can't go" };

/** Labels for the coach's lists. */
export const RSVP_GROUP_LABEL: Record<RsvpAnswer | "none", string> = {
  going: "Going",
  maybe: "Maybe",
  "not-going": "Not going",
  none: "No reply yet",
};

/** A stable number between 0 and 1 for a text, so seeded answers are the same on every visit. */
function stableFraction(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

const HOUR_MS = 3_600_000;

/**
 * Share of members who have replied by `now`: almost everyone for a past session, most people the
 * day before, fewer for sessions further away — as in a real group, where answers arrive over the week.
 */
export function replyShare(session: Pick<Session, "date" | "time">, now: Date) {
  const hours = (sessionStart(session).getTime() - now.getTime()) / HOUR_MS;
  if (hours <= 0) return 0.95;
  if (hours <= 24) return 0.8;
  if (hours <= 72) return 0.65;
  if (hours <= 7 * 24) return 0.45;
  return 0.2;
}

/**
 * The fictional members' answers for one session. Deterministic: each answer depends only on the
 * session, the person and how far away the session is. The demo participant (`selfId`) never gets a
 * seeded answer for a session that has not started, so the visitor can answer it themselves.
 */
export function seededAnswers(
  session: Pick<Session, "id" | "groupId" | "date" | "time" | "status">,
  now: Date,
  { selfId, goingRate = 0.8 }: { selfId?: string; goingRate?: number } = {},
): RsvpAnswers {
  if (session.status === "cancelled") return {};
  const share = replyShare(session, now);
  const started = sessionStart(session) <= now;
  const answers: RsvpAnswers = {};
  for (const p of rosterFor(session.groupId)) {
    if (p.id === selfId && !started) continue;
    if (stableFraction(`${session.id}:${p.id}:replied`) >= share) continue;
    const u = stableFraction(`${session.id}:${p.id}:answer`);
    answers[p.id] = u < goingRate ? "going" : u < goingRate + (1 - goingRate) / 2 ? "maybe" : "not-going";
  }
  return answers;
}

/** The seed with this browser's changes applied, limited to the session group's current members. */
export function answersFor(seed: RsvpAnswers, changes: RsvpChanges, session: Pick<Session, "id" | "groupId">): RsvpAnswers {
  const merged: Record<string, RsvpAnswer | null> = { ...seed, ...(changes[session.id] ?? {}) };
  const result: RsvpAnswers = {};
  for (const p of rosterFor(session.groupId)) {
    const answer = merged[p.id];
    if (answer) result[p.id] = answer;
  }
  return result;
}

export type RsvpSummary = { going: number; maybe: number; notGoing: number; noReply: number; total: number };

/** How many members are going, maybe, not going and have not replied. */
export function summarise(answers: RsvpAnswers, groupId: string): RsvpSummary {
  const roster = rosterFor(groupId);
  const count = (a: RsvpAnswer) => roster.filter((p) => answers[p.id] === a).length;
  const going = count("going");
  const maybe = count("maybe");
  const notGoing = count("not-going");
  return { going, maybe, notGoing, noReply: roster.length - going - maybe - notGoing, total: roster.length };
}

/** "8 going · 1 maybe · 2 not · 3 no reply", leaving out zero counts except "going". */
export function summaryText(s: RsvpSummary) {
  const parts = [`${s.going} going`];
  if (s.maybe) parts.push(`${s.maybe} maybe`);
  if (s.notGoing) parts.push(`${s.notGoing} not going`);
  if (s.noReply) parts.push(`${s.noReply} no reply`);
  return parts.join(" · ");
}

/** The roster split by answer, in a fixed order, for the coach's "Who's coming" list. */
export function membersByAnswer(answers: RsvpAnswers, groupId: string) {
  const roster = rosterFor(groupId);
  const groups: { key: RsvpAnswer | "none"; members: typeof roster }[] = [
    { key: "going", members: [] },
    { key: "maybe", members: [] },
    { key: "not-going", members: [] },
    { key: "none", members: [] },
  ];
  for (const p of roster) {
    const key = answers[p.id] ?? "none";
    groups.find((g) => g.key === key)!.members.push(p);
  }
  return groups.filter((g) => g.members.length > 0);
}

/**
 * The register's starting marks for a new attendance record: members who said they are not going
 * start as absent, everyone else as present (D-056 keeps "present" as the default).
 */
export function registerDefaults(answers: RsvpAnswers, groupId: string): Record<string, AttendanceMark> {
  return Object.fromEntries(rosterFor(groupId).map((p) => [p.id, answers[p.id] === "not-going" ? "absent" : "present"] as const));
}

/** Changes with the answer of one member set (or removed with `null`). Returns a new object. */
export function setAnswer(changes: RsvpChanges, sessionId: string, participantId: string, answer: RsvpAnswer | null): RsvpChanges {
  return { ...changes, [sessionId]: { ...(changes[sessionId] ?? {}), [participantId]: answer } };
}

/** Saved changes read back from the browser, keeping only well-formed entries (D-069). */
export function normaliseRsvpChanges(saved: unknown): RsvpChanges {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
  const result: RsvpChanges = {};
  for (const [sessionId, answers] of Object.entries(saved as Record<string, unknown>)) {
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) continue;
    const clean = Object.fromEntries(
      Object.entries(answers as Record<string, unknown>).filter(([, a]) => a === null || isRsvpAnswer(a)),
    ) as Record<string, RsvpAnswer | null>;
    if (Object.keys(clean).length) result[sessionId] = clean;
  }
  return result;
}

/** Saved reminder times (session id → ISO time), keeping only well-formed entries. */
export function normaliseReminders(saved: unknown): Record<string, string> {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
  return Object.fromEntries(
    Object.entries(saved as Record<string, unknown>).filter(
      (e): e is [string, string] => typeof e[1] === "string" && !Number.isNaN(Date.parse(e[1])),
    ),
  );
}
