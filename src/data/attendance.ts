// Attendance rules (D-036): which participants and which sessions belong together.
// Pure functions, no React.

import type { ScheduleChanges, Session } from "./types";
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
