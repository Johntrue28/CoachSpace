"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ClockIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";
import RecentAttendance from "@/components/attendance/RecentAttendance";
import { sessionsWithoutAttendance } from "@/data/activity";
import { attendanceTotals } from "@/data/dashboard";
import { useDemoStore } from "@/data/store";

const R = 34;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Attendance card body (Figma): share present over all saved sessions as a ring, present and absent
 * totals, a reminder for recent sessions without attendance, then the latest records.
 * Only rendered while attendance is switched on (the dashboard wraps it in <AttendanceOnly>).
 */
export default function AttendanceOverview() {
  const now = useNow();
  const { attendance, schedule, ready } = useDemoStore();
  const totals = attendanceTotals(attendance);
  const missing = useMemo(
    () => (now && ready ? sessionsWithoutAttendance(now, schedule, attendance).reduce((n, g) => n + g.sessionIds.length, 0) : 0),
    [now, ready, schedule, attendance],
  );

  return (
    <>
      {totals.rate !== null && (
        <div className="mb-4 flex items-center gap-5">
          <svg
            viewBox="0 0 80 80"
            className="h-24 w-24 shrink-0"
            role="img"
            aria-label={`${totals.rate}% present over ${totals.sessions} saved session${totals.sessions === 1 ? "" : "s"}`}
          >
            <circle cx="40" cy="40" r={R} fill="none" strokeWidth="9" className="stroke-sunken" />
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              className="stroke-brand"
              strokeDasharray={`${(totals.rate / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            />
            <text x="40" y="45" textAnchor="middle" className="fill-ink text-base font-bold">
              {totals.rate}%
            </text>
          </svg>
          <dl className="flex-1 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-ink-soft">
                <span aria-hidden className="h-2 w-2 rounded-full bg-brand" />
                Present
              </dt>
              <dd className="font-bold text-ink">{totals.present}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-ink-soft">
                <span aria-hidden className="h-2 w-2 rounded-full bg-line-strong" />
                Absent
              </dt>
              <dd className="font-bold text-ink">{totals.absent}</dd>
            </div>
            <p className="text-xs text-ink-soft">
              Over {totals.sessions} saved session{totals.sessions === 1 ? "" : "s"}
            </p>
          </dl>
        </div>
      )}

      {missing > 0 && (
        <Link
          href="/attendance"
          className="mb-3 flex items-center gap-2 rounded-control bg-attention-soft px-3 py-2.5 text-sm text-attention-ink hover:underline"
        >
          <ClockIcon className="h-4 w-4 shrink-0" />
          <span>
            <strong>
              {missing} recent session{missing === 1 ? "" : "s"}
            </strong>{" "}
            without attendance
          </span>
        </Link>
      )}

      <RecentAttendance />
    </>
  );
}
