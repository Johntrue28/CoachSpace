// Attendance rules (D-036): which participants and which sessions belong together.
// Pure functions, no React.

import type { AttendanceRecord, ScheduleChanges, Session } from "./types";
import { NO_CHANGES, addDays, sessionStart, sessionsOn, toDateKey } from "./calendar";
import { participantsOf } from "./groups";

/**
 * The people to mark for a group's session: members of that group only, each once.
 * A participant in several groups appears only in the lists of the groups they belong to.
 */
export function rosterFor(groupId: string) {
  const seen = new Set<string>();
  return participantsOf(groupId).filter((p) => !seen.has(p.id) && seen.add(p.id));
}

/** True when the session belongs to the expected group (or no group was expected). */
export function sessionMatchesGroup(session: Pick<Session, "groupId">, groupId: string | undefined) {
  return !groupId || session.groupId === groupId;
}

/**
 * Sessions of a group that attendance can be taken for: today's sessions that have started or
 * are about to (shown first) and the last two weeks' sessions, newest first. Cancelled
 * sessions are left out.
 */
export function attendanceCandidates(
  groupId: string,
  now: Date,
  changes: ScheduleChanges = NO_CHANGES,
  daysBack = 14,
) {
  const today = toDateKey(now);
  const todays = sessionsOn(today, changes, groupId).filter((s) => s.status !== "cancelled");
  const recent: Session[] = [];
  for (let i = 1; i <= daysBack; i++) {
    recent.push(...sessionsOn(addDays(today, -i), changes, groupId).filter((s) => s.status !== "cancelled"));
  }
  recent.sort((a, b) => sessionStart(b).getTime() - sessionStart(a).getTime());
  return { today: todays, recent };
}

/** A stable number between 0 and 1 for a text, so seeded attendance is the same on every visit. */
function stableFraction(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Attendance the coach "already took" in the last three weeks, so the dashboard and the
 * attendance page have history to show (D-053, audit F-03). For each group the most recent past session
 * is left without attendance, so the demo still shows what is waiting to be taken. About
 * `rate` of each roster is marked present; the marks depend only on the session and the person.
 */
/** How far back the seeded attendance history goes. */
export const SEEDED_DAYS = 21;

export function seedAttendance(groupIds: string[], now: Date, rate: number): AttendanceRecord[] {
  return groupIds.flatMap((groupId) => {
    const { recent } = attendanceCandidates(groupId, now, NO_CHANGES, SEEDED_DAYS);
    return recent.slice(1).map((session) => {
      const marks = Object.fromEntries(
        rosterFor(groupId).map((p) => [p.id, stableFraction(`${session.id}:${p.id}`) < rate ? "present" : "absent"] as const),
      );
      const end = sessionStart({ date: session.date, time: session.endTime });
      return { sessionId: session.id, groupId, marks, savedAt: new Date(end.getTime() + 10 * 60_000).toISOString() };
    });
  });
}

/**
 * Sessions of the last `daysBack` days (today included) that have started, are not cancelled
 * and have no attendance saved, grouped by group, most recent first.
 */
export function sessionsWithoutAttendance(
  now: Date,
  changes: ScheduleChanges,
  attendance: AttendanceRecord[],
  { daysBack = 7 }: { daysBack?: number } = {},
) {
  const taken = new Set(attendance.map((r) => r.sessionId));
  const today = toDateKey(now);
  const byGroup = new Map<string, string[]>();
  for (let i = 0; i <= daysBack; i++) {
    const day = sessionsOn(addDays(today, -i), changes)
      .filter((s) => s.status !== "cancelled" && sessionStart(s) <= now && !taken.has(s.id))
      .sort((a, b) => sessionStart(b).getTime() - sessionStart(a).getTime());
    for (const s of day) byGroup.set(s.groupId, [...(byGroup.get(s.groupId) ?? []), s.id]);
  }
  return [...byGroup].map(([groupId, sessionIds]) => ({ groupId, sessionIds }));
}

/** One saved register, as the attendance log lists it (D-076). */
export type RegisterRow = { sessionId: string; groupId: string; date: string; present: number; total: number };

/**
 * The saved registers of some groups, newest first, each with how many were present out of everyone marked.
 * `dateOf` gives a session's date ("YYYY-MM-DD"); a register whose session is unknown uses the day it was saved.
 */
export function attendanceLog(records: AttendanceRecord[], groupIds: string[], dateOf: (sessionId: string) => string | undefined): RegisterRow[] {
  return records
    .filter((r) => groupIds.includes(r.groupId))
    .map((r) => {
      const marks = Object.values(r.marks);
      return {
        sessionId: r.sessionId,
        groupId: r.groupId,
        date: dateOf(r.sessionId) ?? r.savedAt.slice(0, 10),
        present: marks.filter((m) => m === "present").length,
        total: marks.length,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.groupId.localeCompare(b.groupId));
}

/** The share of "present" marks in a group's saved registers, as a whole percentage (null with no register yet). */
export function groupAttendanceRate(records: AttendanceRecord[], groupId: string): number | null {
  const marks = records.filter((r) => r.groupId === groupId).flatMap((r) => Object.values(r.marks));
  return marks.length ? Math.round((marks.filter((m) => m === "present").length / marks.length) * 100) : null;
}

/**
 * The players who missed most in a group's saved registers: everyone with at least one absence, lowest
 * attendance first (then most absences, then name), at most `limit`.
 */
export function mostMissed(records: AttendanceRecord[], groupId: string, members: { id: string; name: string }[], limit = 3) {
  const mine = records.filter((r) => r.groupId === groupId);
  return members
    .map((p) => {
      const marks = mine.map((r) => r.marks[p.id]).filter((m) => m !== undefined);
      const missed = marks.filter((m) => m === "absent").length;
      return { id: p.id, name: p.name, missed, rate: marks.length ? Math.round(((marks.length - missed) / marks.length) * 100) : 100 };
    })
    .filter((p) => p.missed > 0)
    .sort((a, b) => a.rate - b.rate || b.missed - a.missed || a.name.localeCompare(b.name))
    .slice(0, limit);
}
