"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { addDays, addMonths, isDateKey, monthOf, toDateKey, weekStart } from "@/data/calendar";
import { groups, sessionWords } from "@/data/groups";
import { SHOW_ALL, normaliseHidden, onlyGroup, visibleGroupIds } from "@/data/calendar-filter";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { formatMonth, formatWeekRange } from "@/components/format";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { useNow } from "@/components/useNow";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import DayAgenda from "./DayAgenda";
import MonthAgenda from "./MonthAgenda";
import MonthGrid from "./MonthGrid";
import UpcomingSessions from "./UpcomingSessions";
import WeekBoard from "./WeekBoard";
import { GroupFilterButton, GroupFilterPanel, GroupFilterSummary } from "./GroupFilter";
import { stateKey } from "./sessionStyles";

const navButton = "grid h-9 w-9 shrink-0 place-items-center rounded-control bg-card text-ink-soft shadow-card ring-1 ring-line hover:text-brand-strong hover:ring-brand/40";
const todayButton = buttonClass({ variant: "secondary", size: "sm" });

type Props = {
  /** Month view: the selected date. */
  date?: string;
  /** Week view: any date in the week to show. */
  week?: string;
  view?: "month" | "week";
  /** Coach view: ?group= from a group's "View sessions"; replaces the filter with that group. */
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
 * board, then the next sessions. The view and the date live in the URL; the coach's group filter
 * is saved with the demo data (D-047).
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
  const { calendarHiddenGroups, setCalendarHiddenGroups } = useDemoStore();
  const nav = useNavigation();
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButton = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const allIds = groups.map((g) => g.id);
  // The coach's calendar shows the groups chosen in the filter (D-047); the participant's, their own groups.
  const hidden = canManage ? normaliseHidden(calendarHiddenGroups, allIds) : SHOW_ALL;
  const ids = canManage ? visibleGroupIds(allIds, hidden) : groupIds;
  const noGroups = canManage && ids?.length === 0;
  const query = (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1])));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const selected = view === "month" ? date : week;
  const createDate = isDateKey(selected) ? selected : now ? toDateKey(now) : undefined;

  // ?group= (a group's "View sessions") shows only that group, then leaves the URL.
  useEffect(() => {
    if (!canManage || !groupFilter || !calendar.ready) return;
    setCalendarHiddenGroups(onlyGroup(allIds, groupFilter));
    nav.replace(view === "week" ? query({ view: "week", week }) : query({ date }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, groupFilter, calendar.ready]);

  const closeFilter = () => {
    setFilterOpen(false);
    filterButton.current?.querySelector("button")?.focus();
  };

  const controls = (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {canManage && (
        <div ref={filterButton} className="min-w-0">
          <GroupFilterButton hidden={hidden} open={filterOpen} onToggle={() => setFilterOpen((o) => !o)} panelId={panelId} />
        </div>
      )}
      <div role="group" aria-label="Calendar view" className="flex rounded-control bg-sunken p-1">
        {(["month", "week"] as const).map((v) => (
          <Link
            key={v}
            href={v === "month" ? query({ date: selected }) : query({ view: "week", week: selected })}
            aria-current={view === v ? "page" : undefined}
            className={`inline-flex min-h-8 items-center rounded-lg px-3 text-sm font-semibold text-ink ${view === v ? "bg-card shadow-card" : "hover:bg-card/60"}`}
          >
            {v === "month" ? (
              <>
                {/* Phones show the month as an agenda (R8); the grid from 768 px. */}
                <span className="md:hidden">Agenda</span>
                <span className="hidden md:inline">Month</span>
              </>
            ) : (
              "Week"
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  const filterArea = canManage && (
    <>
      {filterOpen && <GroupFilterPanel id={panelId} hidden={hidden} onChange={setCalendarHiddenGroups} onClose={closeFilter} />}
      <GroupFilterSummary hidden={hidden} onChange={setCalendarHiddenGroups} />
    </>
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
            now={now}
            today={toDateKey(now)}
            initialDate={isDateKey(date) ? date : undefined}
            groupIds={ids}
            noGroups={noGroups}
            basePath={basePath}
            canManage={canManage}
            controls={controls}
            filterArea={filterArea}
            dateUrl={(d) => query({ date: d })}
          />
        ) : (
          <WeekView
            today={toDateKey(now)}
            week={week}
            groupIds={ids}
            basePath={basePath}
            controls={controls}
            filterArea={filterArea}
            weekUrl={(w) => query({ view: "week", week: w })}
          />
        )}
      </div>

      <UpcomingSessions
        limit={3}
        groupIds={ids}
        basePath={basePath}
        title={canManage ? `Upcoming ${sessionWords().many}` : `Next ${sessionWords().many}`}
        emptyText={noGroups ? "No groups selected." : undefined}
        listClassName="xl:grid-cols-3"
        className="mt-8 hidden md:block"
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
  now,
  today,
  initialDate,
  groupIds,
  noGroups,
  basePath,
  canManage,
  controls,
  filterArea,
  dateUrl,
}: {
  now: Date;
  today: string;
  initialDate?: string;
  groupIds?: string[];
  noGroups: boolean;
  basePath: string;
  canManage: boolean;
  controls: React.ReactNode;
  filterArea: React.ReactNode;
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
      {filterArea}
      <div className="md:hidden">
        <MonthAgenda key={month} month={month} today={today} now={now} sessionsOf={sessionsOf} basePath={basePath} canManage={canManage} noGroups={noGroups} />
      </div>
      <div className="hidden md:block">
        <MonthGrid month={month} selected={day} today={today} sessionsOf={sessionsOf} onSelect={select} />
        <ColourKey />
        <div className="mt-4">
          <DayAgenda date={day} today={today} sessions={sessionsOf(day)} basePath={basePath} canManage={canManage} noGroups={noGroups} />
        </div>
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
  filterArea,
  weekUrl,
}: {
  today: string;
  week?: string;
  groupIds?: string[];
  basePath: string;
  controls: React.ReactNode;
  filterArea: React.ReactNode;
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
      {filterArea}
      <WeekBoard days={days} today={today} basePath={basePath} />
      <ColourKey />
    </>
  );
}
