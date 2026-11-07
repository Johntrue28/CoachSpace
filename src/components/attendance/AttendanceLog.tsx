"use client";

import Link from "next/link";
import type { RegisterRow } from "@/data/attendance";
import { colourOf, groupById } from "@/data/groups";
import { formatLogDay } from "@/components/format";
import { ChevronRightIcon } from "@/components/Icons";
import { listClass } from "@/components/ui/Card";

/**
 * Saved registers by date, easy to read (D-076): "Thu 12 Nov · U16 · 8/10 present" with a small bar. A row
 * opens that session's saved register. Used by a group's Attendance tab and by the Attendance page.
 */
export default function AttendanceLog({ rows, showGroup, label }: { rows: RegisterRow[]; showGroup: boolean; label: string }) {
  if (rows.length === 0) return <p className="mt-2 text-sm text-ink-soft">No registers saved yet.</p>;
  return (
    <ul className={listClass("mt-2")} aria-label={label}>
      {rows.map((r) => {
        const group = groupById(r.groupId);
        const pct = r.total ? (r.present / r.total) * 100 : 0;
        return (
          <li key={r.sessionId}>
            <Link href={`/calendar/${r.sessionId}/attendance?group=${r.groupId}`} className="press flex items-center gap-3 px-4 py-3 transition hover:bg-surface">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">
                  <span className="font-semibold">{formatLogDay(r.date)}</span>
                  {showGroup && group && <> · {group.short ?? group.name}</>} ·{" "}
                  <span className="font-semibold tabular-nums">
                    {r.present}/{r.total}
                  </span>{" "}
                  present
                </span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colourOf(r.groupId).solid }} />
                </span>
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
