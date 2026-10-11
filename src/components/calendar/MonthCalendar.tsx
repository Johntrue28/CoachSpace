"use client";

import Link from "next/link";
import { useState } from "react";
import { addMonths, isDateKey, monthGrid, monthOf, toDateKey } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import { formatDateKey, formatMonth } from "@/components/format";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";
import SessionRow from "./SessionRow";

const weekdayLetters = ["M", "T", "W", "T", "F", "S", "S"];
const navButton = "grid h-8 w-8 place-items-center rounded-full text-brand ring-1 ring-line hover:ring-brand";

/**
 * Compact month calendar with the selected day's sessions underneath. Reads sessions from the
 * single calendar source (weekly slots + changes), so one-offs, moves and cancellations show.
 */
export default function MonthCalendar({
  initialDate,
  groupIds,
  sessionPath = "/calendar",
  createPath,
  onSelect,
}: {
  initialDate?: string;
  /** Only these groups' sessions (participant view, or a group filter). */
  groupIds?: string[];
  /** Where a session opens: `${sessionPath}/${id}`. */
  sessionPath?: string;
  /** Shows "New session" for the selected date (coach view). */
  createPath?: string;
  /** Called when the selected date changes (the calendar page keeps it in the URL). */
  onSelect?: (date: string) => void;
}) {
  const now = useNow();
  const { ready, on } = useSessions();
  const [selected, setSelected] = useState<string | null>(isDateKey(initialDate) ? initialDate : null);
  const [shown, setShown] = useState<string | null>(isDateKey(initialDate) ? monthOf(initialDate) : null);

  if (!now || !ready) return <div className="h-80" aria-hidden />;

  const today = toDateKey(now);
  const day = selected ?? today;
  const month = shown ?? monthOf(day);
  const sessionsOf = (date: string) => on(date).filter((s) => !groupIds || groupIds.includes(s.groupId));
  const daySessions = sessionsOf(day);

  function select(date: string) {
    setSelected(date);
    setShown(monthOf(date));
    onSelect?.(date);
  }

  function goMonth(n: number) {
    const next = addMonths(month, n);
    setShown(next);
    // Keep the selection inside the month shown: today if it is there, otherwise the 1st.
    select(monthOf(today) === next ? today : `${next}-01`);
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month" className={navButton}>
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <h2 className="min-w-0 flex-1 text-center font-bold" aria-live="polite">
          {formatMonth(month)}
        </h2>
        <button type="button" onClick={() => goMonth(1)} aria-label="Next month" className={navButton}>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <table className="mt-3 w-full table-fixed border-separate border-spacing-y-1 text-center text-sm" aria-label={formatMonth(month)}>
        <thead>
          <tr>
            {weekdayLetters.map((d, i) => (
              <th key={i} scope="col" className="pb-1 text-xs font-medium text-ink-soft">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week) => (
            <tr key={week[0]}>
              {week.map((date) => {
                const list = sessionsOf(date);
                const active = list.filter((s) => s.status !== "cancelled").length;
                const cancelled = list.length - active;
                const isSelected = date === day;
                const isToday = date === today;
                const outside = monthOf(date) !== month;
                const label = `${formatDateKey(date)}: ${active === 0 ? "no sessions" : `${active} session${active === 1 ? "" : "s"}`}${
                  cancelled ? `, ${cancelled} cancelled` : ""
                }`;
                return (
                  <td key={date} className="px-0.5">
                    <button
                      type="button"
                      onClick={() => select(date)}
                      aria-label={label}
                      aria-pressed={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      className={`mx-auto flex h-10 w-full max-w-10 flex-col items-center justify-center rounded-xl ${
                        isSelected ? "bg-brand text-white" : isToday ? "font-bold text-brand ring-2 ring-brand" : "hover:bg-surface"
                      } ${outside && !isSelected ? "text-ink-soft/50" : ""}`}
                    >
                      <span className="leading-none">{Number(date.slice(8))}</span>
                      <span className="mt-1 flex h-1.5 items-center gap-0.5" aria-hidden>
                        {active > 0 && <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-brand"}`} />}
                        {cancelled > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-700" />}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">
          {day === today ? "Today" : formatDateKey(day)}
        </h3>
        <div className="flex items-center gap-3">
          {(day !== today || monthOf(today) !== month) && (
            <button type="button" onClick={() => select(today)} className="text-sm font-semibold text-brand">
              Today
            </button>
          )}
          {createPath && (
            <Link
              href={`${createPath}?date=${day}`}
              className="flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-sm font-semibold text-white"
            >
              <PlusIcon className="h-4 w-4" /> New session
            </Link>
          )}
        </div>
      </div>
      {daySessions.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-ink-soft">No sessions on this day.</p>
      ) : (
        <ul className="mt-2 space-y-2" aria-label={`Sessions on ${formatDateKey(day)}`}>
          {daySessions.map((s) => (
            <li key={s.id}>
              <SessionRow session={s} href={`${sessionPath}/${s.id}`} past={day < today} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
