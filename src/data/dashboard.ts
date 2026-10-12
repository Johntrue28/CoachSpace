// Figures for the coach dashboard (D-044), worked out from the demo data. Pure, no React (unit tested).

import type { AttendanceRecord, ScheduleChanges } from "./types";
import { attendanceSummary, NO_CHANGES, sessionStart, toDateKey, weekDays, weekStart } from "./calendar";

/** "Good morning" before 12:00, "Good afternoon" before 18:00, then "Good evening". */
export function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Sessions of the current Monday-to-Sunday week (cancelled ones left out) and how many are still to come. */
export function weekSessionStats(now: Date, changes: ScheduleChanges = NO_CHANGES, groupIds?: string[]) {
  const sessions = weekDays(weekStart(toDateKey(now)), { changes, groupIds })
    .flatMap((d) => d.sessions)
    .filter((s) => s.status !== "cancelled");
  return { total: sessions.length, remaining: sessions.filter((s) => sessionStart(s) > now).length };
}

/**
 * Present and absent marks over all saved attendance records, and the share present as a whole
 * percentage (null when nothing has been marked yet).
 */
export function attendanceTotals(records: AttendanceRecord[]) {
  let present = 0;
  let absent = 0;
  for (const record of records) {
    const s = attendanceSummary(record);
    present += s.present;
    absent += s.absent;
  }
  const marked = present + absent;
  return { sessions: records.length, present, absent, rate: marked ? Math.round((present / marked) * 100) : null };
}
