// "Activity in this demo" (D-040): what the bell panel lists, worked out from the demo data in
// this browser. These are not notifications: nothing is pushed, nothing is real-time.
// Pure functions, no React (unit tested).

import type { AttendanceRecord, ScheduleChanges, Session } from "./types";
import { addDays, regularSession, sessionById, sessionStart, sessionsOn, toDateKey } from "./calendar";

export type SessionChange = "cancelled" | "added" | "moved" | "place" | "updated";

export type ActivityItem =
  | { kind: "unread"; conversationId: string; count: number }
  | { kind: "attendance"; groupId: string; sessionIds: string[] }
  | { kind: "session"; session: Session; change: SessionChange };

/** How a session differs from the weekly schedule, or null when it does not. */
export function sessionChange(session: Session, changes: ScheduleChanges): SessionChange | null {
  if (session.status === "cancelled") return "cancelled";
  if (session.kind === "one-off") return "added";
  if (session.movedFrom) return "moved";
  if (session.placeChanged) return "place";
  const title = changes.overrides[session.id]?.title;
  if (title !== undefined && title !== regularSession(session.id)?.title) return "updated";
  return null;
}

/** Changed or added sessions from today to `daysAhead` days ahead, soonest first. */
export function changedSessions(
  now: Date,
  changes: ScheduleChanges,
  { groupIds, daysAhead = 14 }: { groupIds?: string[]; daysAhead?: number } = {},
) {
  const from = toDateKey(now);
  const to = addDays(from, daysAhead);
  const ids = [...Object.keys(changes.overrides), ...changes.oneOffs.map((o) => o.id)];
  return ids
    .map((id) => sessionById(id, changes))
    .filter((s): s is Session => Boolean(s && s.date >= from && s.date <= to))
    .filter((s) => !groupIds || groupIds.includes(s.groupId))
    .map((session) => ({ session, change: sessionChange(session, changes) }))
    .filter((x): x is { session: Session; change: SessionChange } => x.change !== null)
    .sort((a, b) => sessionStart(a.session).getTime() - sessionStart(b.session).getTime());
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

/**
 * Everything the panel lists, in order: unread conversations, sessions without attendance
 * (coach only), then changed sessions. `groupIds` limits sessions to the viewer's groups.
 */
export function buildActivity({
  now,
  unread,
  changes,
  attendance,
  groupIds,
  includeAttendance,
}: {
  now: Date;
  unread: { conversationId: string; count: number }[];
  changes: ScheduleChanges;
  attendance: AttendanceRecord[];
  groupIds?: string[];
  includeAttendance: boolean;
}): ActivityItem[] {
  return [
    ...unread.filter((u) => u.count > 0).map((u): ActivityItem => ({ kind: "unread", ...u })),
    ...(includeAttendance
      ? sessionsWithoutAttendance(now, changes, attendance)
          .filter((g) => !groupIds || groupIds.includes(g.groupId))
          .map((g): ActivityItem => ({ kind: "attendance", ...g }))
      : []),
    ...changedSessions(now, changes, { groupIds }).map((c): ActivityItem => ({ kind: "session", ...c })),
  ];
}
