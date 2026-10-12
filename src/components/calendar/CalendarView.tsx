"use client";

import Link from "next/link";
import { useState } from "react";
import { addDays, addMonths, isDateKey, monthOf, toDateKey, weekStart } from "@/data/calendar";
import { groupById } from "@/data/groups";
import { useSessions } from "@/data/use-sessions";
import { formatMonth, formatWeekRange } from "@/components/format";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { useNow } from "@/components/useNow";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import DayAgenda from "./DayAgenda";
import MonthGrid from "./MonthGrid";
import UpcomingSessions from "./UpcomingSessions";
import WeekBoard from "./WeekBoard";
import { stateKey } from "./sessionStyles";

const navButton = "grid h-9 w-9 shrink-0 place-items-center rounded-control bg-card text-ink-soft shadow-card ring-1 ring-line hover:text-brand-strong hover:ring-brand/40";
const todayButton = buttonClass({ variant: "secondary", size: "sm" });

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
  title?: string;
  subtitle?: string;
  /** Coach view: create and reschedule sessions. */
  canManage?: boolean;
};

/**
 * Calendar page (Figma Calendar, D-045): month grid with the selected day's sessions, or a week
 * board, then the next sessions. The view, the date and the group filter live in the URL.
 */
export default function CalendarView({
  date,
  week,
  view = "month",
  groupFilter,
  groupIds,
  basePath = "/calendar",
  title = "Calendar",
  subtitle = "Plan sessions and keep every group on schedule.",
  canManage = false,
}: Props) {
  const now = useNow();
  const calendar = useSessions();
  const filter = groupFilter && groupById(groupFilter) ? groupFilter : undefined;
  const ids = filter ? [filter] : groupIds;
  const query = (params: Record<string, string | undefined>, allGroups = false) => {
    const all = { ...params, group: allGroups ? undefined : filter };
    const q = new URLSearchParams(Object.entries(all).filter((e): e is [string, string] => Boolean(e[1])));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const selected = view === "month" ? date : week;
  const createDate = isDateKey(selected) ? selected : now ? toDateKey(now) : undefined;

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {filter && (
        <Link
          href={view === "week" ? query({ view: "week", week }, true) : query({ date }, true)}
          className="inline-flex min-h-9 items-center rounded-full bg-brand-soft px-3 text-sm font-semibold text-brand-strong"
          aria-label={`Showing ${groupById(filter)?.name} only. Show all groups`}
        >
          {groupById(filter)?.name} ✕
        </Link>
      )}
      <div role="group" aria-label="Calendar view" className="flex rounded-control bg-sunken p-1">
        {(["month", "week"] as const).map((v) => (
          <Link
            key={v}
            href={v === "month" ? query({ date: selected }) : query({ view: "week", week: selected })}
            aria-current={view === v ? "page" : undefined}
            className={`inline-flex min-h-8 items-center rounded-lg px-3 text-sm font-semibold text-ink ${view === v ? "bg-card shadow-card" : "hover:bg-card/60"}`}
          >
            {v === "month" ? "Month" : "Week"}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title={title}
        description={subtitle}
        action={
          canManage && (
            <ButtonLink href={`/calendar/new${createDate ? `?date=${createDate}` : ""}`}>
              <PlusIcon className="h-4 w-4" /> Create session
            </ButtonLink>
          )
        }
      />

      <div className="mt-6">
        {!now || !calendar.ready ? (
          <Loading block />
        ) : view === "month" ? (
          <MonthView
            today={toDateKey(now)}
            initialDate={isDateKey(date) ? date : undefined}
            groupIds={ids}
            basePath={basePath}
            canManage={canManage}
            controls={controls}
            dateUrl={(d) => query({ date: d })}
          />
        ) : (
          <WeekView today={toDateKey(now)} week={week} groupIds={ids} basePath={basePath} controls={controls} weekUrl={(w) => query({ view: "week", week: w })} />
        )}
      </div>

      <UpcomingSessions
        limit={3}
        groupIds={ids}
        basePath={basePath}
        title={canManage ? "Upcoming sessions" : "Next sessions"}
        listClassName="xl:grid-cols-3"
        className="mt-8"
      />
    </main>
  );
}

function Toolbar({ children, controls }: { children: React.ReactNode; controls: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">{children}</div>
      {controls}
    </div>
  );
}

function ColourKey() {
  return (
    <ul aria-label="Colour key" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
      {stateKey.map((k) => (
        <li key={k.state} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${k.dot}`} aria-hidden />
          {k.label}
        </li>
      ))}
    </ul>
  );
}

function MonthView({
  today,
  initialDate,
  groupIds,
  basePath,
  canManage,
  controls,
  dateUrl,
}: {
  today: string;
  initialDate?: string;
  groupIds?: string[];
  basePath: string;
  canManage: boolean;
  controls: React.ReactNode;
  dateUrl: (date: string) => string;
}) {
  const { on } = useSessions();
  const nav = useNavigation();
  const [day, setDay] = useState(initialDate ?? today);
  const [month, setMonth] = useState(monthOf(initialDate ?? today));
  const sessionsOf = (d: string) => on(d).filter((s) => !groupIds || groupIds.includes(s.groupId));

  function select(d: string) {
    setDay(d);
    setMonth(monthOf(d));
    nav.replace(dateUrl(d));
  }

  function goMonth(n: number) {
    const next = addMonths(month, n);
    // Keep the selection inside the month shown: today if it is there, otherwise the 1st.
    select(monthOf(today) === next ? today : `${next}-01`);
  }

  return (
    <>
      <Toolbar controls={controls}>
        <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month" className={navButton}>
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <h2 className="min-w-32 text-center text-sm font-bold text-ink" aria-live="polite">
          {formatMonth(month)}
        </h2>
        <button type="button" onClick={() => goMonth(1)} aria-label="Next month" className={navButton}>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => select(today)} className={`${todayButton} ml-1`}>
          Today
        </button>
      </Toolbar>
      <MonthGrid month={month} selected={day} today={today} sessionsOf={sessionsOf} onSelect={select} />
      <ColourKey />
      <div className="mt-4">
        <DayAgenda date={day} today={today} sessions={sessionsOf(day)} basePath={basePath} canManage={canManage} />
      </div>
    </>
  );
}

function WeekView({
  today,
  week,
  groupIds,
  basePath,
  controls,
  weekUrl,
}: {
  today: string;
  week?: string;
  groupIds?: string[];
  basePath: string;
  controls: React.ReactNode;
  weekUrl: (start: string) => string;
}) {
  const calendar = useSessions();
  const thisWeek = weekStart(today);
  const start = isDateKey(week) ? weekStart(week) : thisWeek;
  const days = calendar.week(start, groupIds);
  const total = days.reduce((n, d) => n + d.sessions.filter((s) => s.status !== "cancelled").length, 0);

  return (
    <>
      <Toolbar controls={controls}>
        <Link href={weekUrl(addDays(start, -7))} aria-label="Previous week" className={navButton}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div className="min-w-32 text-center">
          <h2 className="text-sm font-bold text-ink">{formatWeekRange(start, addDays(start, 6))}</h2>
          <p className="text-xs text-ink-soft">
            {start === thisWeek ? "This week" : `${total} session${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href={weekUrl(addDays(start, 7))} aria-label="Next week" className={navButton}>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
        <Link href={weekUrl(thisWeek)} className={`${todayButton} ml-1`}>
          Today
        </Link>
      </Toolbar>
      <WeekBoard days={days} today={today} basePath={basePath} />
      <ColourKey />
    </>
  );
}
