import Link from "next/link";
import { sessionState } from "@/data/calendar";
import { groupName } from "@/data/groups";
import type { Session } from "@/data/types";
import { formatDateKey } from "@/components/format";
import { PinIcon } from "@/components/Icons";
import SessionBadges from "./SessionBadges";
import { stateAccent, stateText } from "./sessionStyles";

const weekdayShort = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

/**
 * Week view of the Calendar page: seven columns from 1280 px (Figma week grid), a list of days on
 * smaller screens. Every session is a card that opens it.
 */
export default function WeekBoard({
  days,
  today,
  basePath,
}: {
  days: { date: string; sessions: Session[] }[];
  today: string;
  basePath: string;
}) {
  return (
    <ol className="grid gap-4 xl:grid-cols-7 xl:gap-0 xl:overflow-hidden xl:rounded-card xl:bg-card xl:shadow-card xl:ring-1 xl:ring-line">
      {days.map(({ date, sessions }) => {
        const isToday = date === today;
        return (
          <li key={date} id={`day-${date}`} aria-label={formatDateKey(date)} className="min-w-0 scroll-mt-4 xl:min-h-96 xl:border-l xl:border-line xl:first:border-l-0">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink xl:mb-0 xl:flex-col xl:gap-1 xl:border-b xl:border-line xl:py-2.5">
              <span className="xl:hidden">{formatDateKey(date)}</span>
              <span className="hidden text-label font-bold uppercase tracking-wider text-ink-soft xl:inline">
                {weekdayShort.format(new Date(`${date}T00:00:00Z`))}
              </span>
              <span
                className={`hidden h-7 w-7 place-items-center rounded-full text-sm font-bold xl:grid ${isToday ? "bg-brand-strong text-on-brand" : ""}`}
                aria-hidden
              >
                {Number(date.slice(8))}
              </span>
              {isToday && <span className="rounded-full bg-brand-strong px-2 py-0.5 text-label font-bold text-on-brand xl:sr-only">Today</span>}
            </h3>
            <div className="xl:p-2">
              {sessions.length === 0 ? (
                <p className="rounded-control border border-dashed border-line-strong px-4 py-3 text-sm text-ink-soft xl:border-0 xl:px-1 xl:py-1 xl:text-xs">
                  No sessions
                </p>
              ) : (
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li key={s.id}>
                      <WeekSession session={s} href={`${basePath}/${s.id}`} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function WeekSession({ session: s, href }: { session: Session; href: string }) {
  const state = sessionState(s);
  return (
    <Link
      href={href}
      className={`block rounded-control border-l-4 bg-card p-3 shadow-card ring-1 ring-line transition hover:shadow-raised hover:ring-brand/30 xl:p-2 ${stateAccent[state]}`}
    >
      <span className={`block text-xs font-bold ${stateText[state]}`}>
        {s.time}–{s.endTime}
      </span>
      <span className={`mt-0.5 block text-sm font-bold ${state === "cancelled" ? "text-ink-soft line-through" : "text-ink"}`}>{s.title}</span>
      <span className="mt-0.5 block truncate text-xs text-ink-soft">{groupName(s.groupId)}</span>
      <span className="flex items-center gap-1 text-xs text-ink-soft">
        <PinIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{s.place}</span>
      </span>
      <span className="mt-1.5 block empty:hidden">
        <SessionBadges session={s} />
      </span>
    </Link>
  );
}
