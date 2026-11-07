"use client";

import { useEffect, useId, useRef, useState } from "react";
import { addMonths, isDateKey, monthOf, toDateKey } from "@/data/calendar";
import { groups } from "@/data/groups";
import { normaliseHidden, onlyGroup, visibleGroupIds } from "@/data/calendar-filter";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { formatMonth } from "@/components/format";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { useNow } from "@/components/useNow";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import DayAgenda from "./DayAgenda";
import MonthGrid from "./MonthGrid";
import { GroupFilterButton, GroupFilterPanel, GroupFilterSummary } from "./GroupFilter";
import { stateKey } from "./sessionStyles";

const navButton = "grid h-11 w-11 shrink-0 place-items-center rounded-control bg-card text-ink-soft shadow-card ring-1 ring-line hover:text-brand-strong hover:ring-brand/40";
const todayButton = buttonClass({ variant: "secondary", size: "sm", className: "min-h-11" });

/**
 * The coach's Calendar (D-045, D-076), reached from Profile: the month only, on every screen size — a month grid
 * with the groups' colours and the selected day's sessions below. The group filter is saved with the demo data
 * (D-047); `?group=` (a group's Sessions tab) shows that group only. New session opens the session form.
 */
export default function CalendarView({ date, groupFilter }: { date?: string; groupFilter?: string }) {
  const now = useNow();
  const calendar = useSessions();
  const { calendarHiddenGroups, setCalendarHiddenGroups } = useDemoStore();
  const nav = useNavigation();
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButton = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const allIds = groups.map((g) => g.id);
  const hidden = normaliseHidden(calendarHiddenGroups, allIds);
  const ids = visibleGroupIds(allIds, hidden);
  const today = now ? toDateKey(now) : undefined;
  const [day, setDay] = useState<string | undefined>(isDateKey(date) ? date : undefined);
  const selected = day ?? today;
  const [month, setMonth] = useState<string | undefined>(isDateKey(date) ? monthOf(date) : undefined);
  const shownMonth = month ?? (today ? monthOf(today) : undefined);

  // ?group= (a group's Sessions tab) shows only that group, then leaves the URL.
  useEffect(() => {
    if (!groupFilter || !calendar.ready) return;
    setCalendarHiddenGroups(onlyGroup(allIds, groupFilter));
    nav.replace(date ? `/calendar?date=${date}` : "/calendar");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupFilter, calendar.ready]);

  const select = (d: string) => {
    setDay(d);
    setMonth(monthOf(d));
    nav.replace(`/calendar?date=${d}`);
  };
  const goMonth = (n: number) => {
    if (!shownMonth || !today) return;
    const next = addMonths(shownMonth, n);
    // Keep the selection inside the month shown: today if it is there, otherwise the 1st.
    select(monthOf(today) === next ? today : `${next}-01`);
  };
  const closeFilter = () => {
    setFilterOpen(false);
    filterButton.current?.querySelector("button")?.focus();
  };
  const sessionsOf = (d: string) => calendar.on(d).filter((s) => ids.includes(s.groupId));

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title="Calendar"
        description="Every group's sessions, month by month."
        action={
          <ButtonLink href={`/calendar/new${selected ? `?date=${selected}` : ""}`}>
            <PlusIcon className="h-4 w-4" /> New session
          </ButtonLink>
        }
      />

      <div className="mt-6">
        {!now || !calendar.ready || !today || !selected || !shownMonth ? (
          <Loading block />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month" className={navButton}>
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <h2 className="min-w-32 text-center text-sm font-bold text-ink" aria-live="polite">
                  {formatMonth(shownMonth)}
                </h2>
                <button type="button" onClick={() => goMonth(1)} aria-label="Next month" className={navButton}>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => select(today)} className={`${todayButton} ml-1`}>
                  Today
                </button>
              </div>
              <div ref={filterButton} className="min-w-0">
                <GroupFilterButton hidden={hidden} open={filterOpen} onToggle={() => setFilterOpen((o) => !o)} panelId={panelId} />
              </div>
            </div>
            {filterOpen && <GroupFilterPanel id={panelId} hidden={hidden} onChange={setCalendarHiddenGroups} onClose={closeFilter} />}
            <GroupFilterSummary hidden={hidden} onChange={setCalendarHiddenGroups} />
            <MonthGrid month={shownMonth} selected={selected} today={today} sessionsOf={sessionsOf} onSelect={select} />
            <ul aria-label="Colour key" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
              {stateKey.map((k) => (
                <li key={k.state} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${k.dot}`} aria-hidden />
                  {k.label}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <DayAgenda date={selected} today={today} sessions={sessionsOf(selected)} noGroups={ids.length === 0} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
