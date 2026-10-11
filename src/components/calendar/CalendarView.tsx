"use client";

import Link from "next/link";
import { addDays, isDateKey, toDateKey, weekStart } from "@/data/calendar";
import { groupById } from "@/data/groups";
import { useSessions } from "@/data/use-sessions";
import { formatDateKey, formatWeekRange } from "@/components/format";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { useNow } from "@/components/useNow";
import MonthCalendar from "./MonthCalendar";
import SessionRow from "./SessionRow";
import { buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";

const navButton = "grid h-9 w-9 place-items-center rounded-full bg-card text-brand-strong ring-1 ring-line hover:ring-brand";

type Props = {
  /** Month view: the selected date. */
  date?: string;
  /** Week view: any date in the week to show. */
  week?: string;
  view?: "month" | "week";
  /** Coach view: only this group's sessions. */
  groupFilter?: string;
  /** Participant view: only these groups. */
  groupIds?: string[];
  basePath?: string;
  subtitle?: string;
  /** Coach view: show the "New session" action. */
  canManage?: boolean;
};

/** Calendar page: a month calendar with the selected day's sessions, or a week list. */
export default function CalendarView({
  date,
  week,
  view = "month",
  groupFilter,
  groupIds,
  basePath = "/calendar",
  subtitle = "Training sessions for all your groups.",
  canManage = false,
}: Props) {
  const now = useNow();
  const calendar = useSessions();
  const nav = useNavigation();
  const filter = groupFilter && groupById(groupFilter) ? groupFilter : undefined;
  const ids = filter ? [filter] : groupIds;
  const query = (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ ...params, group: filter }).filter((e): e is [string, string] => Boolean(e[1])));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <main className="px-4 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        </div>
        {canManage && view === "week" && (
          <Link
            href={`/calendar/new${isDateKey(week) ? `?date=${week}` : ""}`}
            className={buttonClass({ size: "sm", className: "shrink-0" })}
          >
            <PlusIcon className="h-4 w-4" /> New session
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Calendar view" className="flex rounded-full bg-card p-0.5 ring-1 ring-line">
          {(["month", "week"] as const).map((v) => (
            <Link
              key={v}
              href={v === "month" ? query({ date }) : query({ view: "week", week: date })}
              aria-current={view === v ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${view === v ? "bg-brand text-on-brand" : "text-ink-soft"}`}
            >
              {v === "month" ? "Month" : "Week"}
            </Link>
          ))}
        </div>
        {filter && (
          <Link
            href={view === "week" ? `${basePath}?view=week${week ? `&week=${week}` : ""}` : `${basePath}${date ? `?date=${date}` : ""}`}
            className="rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-strong"
            aria-label={`Showing ${groupById(filter)?.name} only. Show all groups`}
          >
            {groupById(filter)?.name} ✕
          </Link>
        )}
      </div>

      <div className="mt-4">
        {!now || !calendar.ready ? (
          <Loading block />
        ) : view === "month" ? (
          <MonthCalendar
            initialDate={isDateKey(date) ? date : undefined}
            groupIds={ids}
            sessionPath={basePath}
            createPath={canManage ? "/calendar/new" : undefined}
            onSelect={(d) => nav.replace(query({ date: d }))}
          />
        ) : (
          <WeekList today={toDateKey(now)} week={week} groupIds={ids} basePath={basePath} weekUrl={(w) => query({ view: "week", week: w })} />
        )}
      </div>
    </main>
  );
}

function WeekList({
  today,
  week,
  groupIds,
  basePath,
  weekUrl,
}: {
  today: string;
  week?: string;
  groupIds?: string[];
  basePath: string;
  weekUrl: (start: string) => string;
}) {
  const calendar = useSessions();
  const thisWeek = weekStart(today);
  const start = isDateKey(week) ? weekStart(week) : thisWeek;
  const days = calendar.week(start, groupIds);
  const total = days.reduce((n, d) => n + d.sessions.filter((s) => s.status !== "cancelled").length, 0);

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={weekUrl(addDays(start, -7))} aria-label="Previous week" className={navButton}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h2 className="font-bold">{formatWeekRange(start, addDays(start, 6))}</h2>
          <p className="text-xs text-ink-soft">
            {start === thisWeek ? "This week" : `${total} session${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href={weekUrl(addDays(start, 7))} aria-label="Next week" className={navButton}>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
      {start !== thisWeek && (
        <div className="mt-2 text-center">
          <Link href={weekUrl(thisWeek)} className="text-sm font-semibold text-brand-strong">
            Back to this week
          </Link>
        </div>
      )}

      <ol className="mt-4 space-y-3">
        {days.map(({ date, sessions }) => (
          <li key={date} id={`day-${date}`} aria-label={formatDateKey(date)} className="scroll-mt-4">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              {formatDateKey(date)}
              {date === today && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-label font-bold text-on-brand">Today</span>
              )}
            </h3>
            {sessions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-ink-soft">No sessions</p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <SessionRow session={s} href={`${basePath}/${s.id}`} past={date < today} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
