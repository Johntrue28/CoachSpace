"use client";

import type { StripDay } from "@/data/look";
import { colourOf, groupName } from "@/data/groups";

/**
 * The next seven days as a strip of day buttons (D-074, as in TeamSnap and Spond): coloured dots show
 * which groups train that day. Choosing a day shows only that day below; choosing it again shows the week.
 */
export default function WeekStrip({ days, selected, onSelect }: { days: StripDay[]; selected: string | null; onSelect: (date: string | null) => void }) {
  return (
    <div role="group" aria-label="Choose a day" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="grid min-w-[22rem] grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const on = selected === d.date;
          const names = d.groupIds.map(groupName).join(", ");
          return (
            <li key={d.date}>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${i === 0 ? "Today" : d.weekday} ${d.day}: ${d.groupIds.length ? names : "no sessions"}`}
                onClick={() => onSelect(on ? null : d.date)}
                className={`press flex min-h-16 w-full flex-col items-center justify-center rounded-2xl py-2 ring-1 ring-inset transition ${
                  on ? "bg-brand-strong text-on-brand ring-brand-strong" : i === 0 ? "bg-card text-ink ring-brand" : "bg-card text-ink ring-line hover:bg-surface"
                }`}
              >
                <span className={`text-label font-bold uppercase ${on ? "text-on-brand" : "text-ink-soft"}`}>{i === 0 ? "Today" : d.weekday}</span>
                <span className="text-base font-bold tabular-nums">{d.day}</span>
                <span className="mt-0.5 flex h-1.5 gap-0.5" aria-hidden="true">
                  {d.groupIds.slice(0, 3).map((g) => (
                    <span key={g} className="h-1.5 w-1.5 rounded-full ring-1 ring-card" style={{ backgroundColor: colourOf(g).solid }} />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
