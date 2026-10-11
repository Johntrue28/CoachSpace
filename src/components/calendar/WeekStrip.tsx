"use client";

import Link from "next/link";
import { toDateKey, weekStart, weekdayOf } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import { formatDateKey } from "@/components/format";
import { useNow } from "@/components/useNow";

const letters = ["", "M", "T", "W", "T", "F", "S", "S"];

/** Compact view of this week: each day shows how many sessions take place (and cancellations). */
export default function WeekStrip({ groupIds, calendarPath = "/calendar" }: { groupIds?: string[]; calendarPath?: string }) {
  const now = useNow();
  const { ready, week } = useSessions();
  if (!now || !ready) return <div className="h-16" aria-hidden />;

  const today = toDateKey(now);
  const start = weekStart(today);
  return (
    <ol className="grid grid-cols-7 gap-1" aria-label="This week">
      {week(start, groupIds).map(({ date, sessions }) => {
        const active = sessions.filter((s) => s.status !== "cancelled").length;
        const cancelled = sessions.length - active;
        const label = `${formatDateKey(date)}: ${active} session${active === 1 ? "" : "s"}${cancelled ? `, ${cancelled} cancelled` : ""}`;
        return (
          <li key={date}>
            <Link
              href={`${calendarPath}?week=${start}#day-${date}`}
              aria-label={label}
              className={`flex flex-col items-center rounded-xl py-1.5 text-xs ring-1 ${
                date === today ? "bg-brand text-white ring-brand" : "bg-surface ring-line"
              } ${date < today ? "opacity-60" : ""}`}
            >
              <span className={date === today ? "text-white/80" : "text-ink-soft"}>{letters[weekdayOf(date)]}</span>
              <span className="font-bold">{Number(date.slice(8))}</span>
              <span className="mt-0.5 flex h-2 items-center gap-0.5" aria-hidden>
                {Array.from({ length: Math.min(active, 3) }, (_, i) => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${date === today ? "bg-white" : "bg-brand"}`} />
                ))}
                {cancelled > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-700" />}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
