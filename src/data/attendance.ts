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
