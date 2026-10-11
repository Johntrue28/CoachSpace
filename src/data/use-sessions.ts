"use client";

// Calendar functions bound to the coach's saved changes, so every screen (calendar, dashboard,
// groups, attendance, participant view) reads sessions from the same source.

import { useMemo } from "react";
import { useDemoStore } from "./store";
import { sessionById, sessionsOn, upcomingSessions, weekDays } from "./calendar";

export function useSessions() {
  const { schedule, ready } = useDemoStore();
  return useMemo(
    () => ({
      /** False until saved calendar changes have been read from this device. */
      ready,
      changes: schedule,
      byId: (id: string) => sessionById(id, schedule),
      on: (date: string, groupId?: string) => sessionsOn(date, schedule, groupId),
      week: (start: string, groupIds?: string[]) => weekDays(start, { changes: schedule, groupIds }),
      upcoming: (now: Date, opts: Parameters<typeof upcomingSessions>[1] = {}) =>
        upcomingSessions(now, { ...opts, changes: schedule }),
    }),
    [schedule, ready],
  );
}
