import { monthGrid, monthOf, sessionState } from "@/data/calendar";
import { colourOf, groupCode } from "@/data/groups";
import type { Session } from "@/data/types";
import { formatDateKey, formatMonth } from "@/components/format";
import { stateChip } from "./sessionStyles";
import { t, tn } from "@/i18n";

/** Sessions shown in a day cell; the rest are counted ("+1"). */
const MAX_CHIPS = 2;

/** "Wednesday 14 Oct: 2 sessions, 1 cancelled": the accessible name of a day in a month calendar. */
export function dayLabel(date: string, sessions: Session[]) {
  const active = sessions.filter((s) => s.status !== "cancelled").length;
  const cancelled = sessions.length - active;
  const count = active === 0 ? t("calendar.dayNone") : tn("calendar.daySessions", active);
  return t("calendar.dayLabel", { day: formatDateKey(date), sessions: count }) + (cancelled ? tn("calendar.dayCancelled", cancelled) : "");
}

/**
 * Full-size month grid of the Calendar page (Figma): each day is one button that selects it, with
 * its sessions as small coloured labels (time and group code on phones, plus the title from 640 px).
 */
export default function MonthGrid({
  month,
  selected,
  today,
  sessionsOf,
  onSelect,
}: {
  /** "YYYY-MM" */
  month: string;
  selected: string;
  today: string;
  sessionsOf: (date: string) => Session[];
  onSelect: (date: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line">
      <table className="w-full table-fixed border-collapse" aria-label={formatMonth(month)}>
        <thead>
          <tr>
            {t("calendar.weekdays").split(",").map((d) => (
              <th key={d} scope="col" className="border-b border-line py-2.5 text-center text-label font-bold uppercase tracking-wider text-ink-soft">
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
                const isSelected = date === selected;
                const isToday = date === today;
                const outside = monthOf(date) !== month;
                const more = list.length - MAX_CHIPS;
                return (
                  <td key={date} className="h-px border-l border-t border-line p-0 align-top first:border-l-0">
                    <button
                      type="button"
                      onClick={() => onSelect(date)}
                      aria-label={dayLabel(date, list)}
                      aria-pressed={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      className={`flex h-full min-h-16 w-full flex-col gap-1 p-1 text-left focus-visible:-outline-offset-4 sm:min-h-24 sm:p-2 lg:min-h-28 ${
                        isSelected ? "bg-brand-soft ring-2 ring-inset ring-brand" : outside ? "bg-canvas hover:bg-surface" : "hover:bg-surface"
                      } ${outside ? "text-ink-soft" : "text-ink"}`}
                    >
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                          isToday ? "bg-brand-strong text-on-brand" : isSelected ? "font-bold text-brand-strong" : ""
                        }`}
                      >
                        {Number(date.slice(8))}
                      </span>
                      {list.slice(0, MAX_CHIPS).map((s) => (
                        <span
                          key={s.id}
                          className={`block w-full truncate rounded-md border-l-[3px] px-0.5 py-0.5 text-center text-label font-semibold tabular-nums sm:px-1.5 sm:text-left ${stateChip[sessionState(s)]}`}
                          // The group's colour on the left edge (D-074); the fill still shows the session's state.
                          style={{ borderLeftColor: colourOf(s.groupId).solid }}
                        >
                          <span className="block sm:inline">{s.time}</span>
                          {/* Which group, without a tap (D-061, audit F-13). The day's own list names it in full. */}
                          <span className="block font-bold sm:inline sm:font-semibold">
                            <span className="hidden sm:inline"> · </span>
                            {groupCode(s.groupId)}
                          </span>
                          <span className="hidden sm:inline"> {s.title}</span>
                        </span>
                      ))}
                      {more > 0 && <span className="px-1 text-label font-semibold text-ink-soft">+{more}</span>}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
