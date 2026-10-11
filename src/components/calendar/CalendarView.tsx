"use client";

import Link from "next/link";
import { addDays, isDateKey, toDateKey, weekDays, weekStart } from "@/data/calendar";
import { groupName } from "@/data/groups";
import { formatDateKey, formatWeekRange } from "@/components/format";
import { ArrowLeftIcon, ChevronRightIcon, PinIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";

const navButton = "grid h-9 w-9 place-items-center rounded-full bg-card text-brand ring-1 ring-line hover:ring-brand";

/**
 * Monday-to-Sunday week. `week` is any date in the week to show; defaults to the current week.
 * With `groupIds`, only those groups' sessions are shown (participant view).
 */
export default function CalendarView({
  week,
  groupIds,
  basePath = "/calendar",
  subtitle = "Training sessions for all your groups.",
}: {
  week?: string;
  groupIds?: string[];
  basePath?: string;
  subtitle?: string;
}) {
  const now = useNow();

  if (!now) {
    return (
      <main className="px-4 pt-8">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>
      </main>
    );
  }

  const today = toDateKey(now);
  const thisWeek = weekStart(today);
  const start = isDateKey(week) ? weekStart(week) : thisWeek;
  const days = weekDays(start, groupIds);
  const total = days.reduce((n, d) => n + d.sessions.length, 0);

  return (
    <main className="px-4 pt-8">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>

      <div className="mt-5 flex items-center gap-2">
        <Link href={`${basePath}?week=${addDays(start, -7)}`} aria-label="Previous week" className={navButton}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h2 className="font-bold">{formatWeekRange(start, addDays(start, 6))}</h2>
          <p className="text-xs text-ink-soft">
            {start === thisWeek ? "This week" : `${total} session${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href={`${basePath}?week=${addDays(start, 7)}`} aria-label="Next week" className={navButton}>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
      {start !== thisWeek && (
        <div className="mt-2 text-center">
          <Link href={basePath} className="text-sm font-semibold text-brand">
            Back to this week
          </Link>
        </div>
      )}

      <ol className="mt-4 space-y-3">
        {days.map(({ date, sessions }) => (
          <li key={date} aria-label={formatDateKey(date)}>
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              {formatDateKey(date)}
              {date === today && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">Today</span>
              )}
            </h3>
            {sessions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-ink-soft">No sessions</p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`${basePath}/${s.id}`}
                      className={`flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-line hover:ring-brand ${
                        date < today ? "opacity-70" : ""
                      }`}
                    >
                      <div className="w-14 shrink-0 text-sm">
                        <p className="font-semibold">{s.time}</p>
                        <p className="text-xs text-ink-soft">{s.endTime}</p>
                      </div>
                      <div className="min-w-0 flex-1 border-l-2 border-brand pl-3">
                        <p className="truncate font-semibold">{s.title}</p>
                        <p className="truncate text-sm text-ink-soft">{groupName(s.groupId)}</p>
                        <p className="flex items-center gap-1 text-xs text-ink-soft">
                          <PinIcon className="h-3.5 w-3.5" /> {s.place}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
