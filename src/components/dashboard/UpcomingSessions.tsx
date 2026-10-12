"use client";

import Link from "next/link";
import { ChevronRightIcon, ClockIcon, PinIcon } from "@/components/Icons";
import { relativeDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";
import { cardClass } from "@/components/ui/Card";
import { Loading } from "@/components/ui/EmptyState";
import SessionBadges from "@/components/calendar/SessionBadges";
import { toDateKey } from "@/data/calendar";
import { groupName } from "@/data/groups";
import { useSessions } from "@/data/use-sessions";
import type { Session } from "@/data/types";

const weekdayShort = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

/**
 * The sessions after the next one (the next session has its own card with actions), as date
 * cards in the Figma style. Today's sessions use the brand colours, other days the calendar blue.
 */
export default function UpcomingSessions({ limit = 4 }: { limit?: number }) {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  const list = now && ready ? upcoming(now, { limit: limit + 1, activeOnly: true }).slice(1) : null;

  return (
    <section aria-labelledby="upcoming-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="upcoming-heading" className="text-base font-bold text-ink">
          Upcoming sessions
        </h2>
        <Link href="/calendar" className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-strong hover:underline">
          See full schedule
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
      {!list || !now ? (
        <Loading />
      ) : list.length === 0 ? (
        <p className="text-sm text-ink-soft">No other sessions in the next two weeks.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((s) => (
            <li key={s.id}>
              <SessionTile session={s} todayKey={toDateKey(now)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SessionTile({ session, todayKey }: { session: Session; todayKey: string }) {
  const today = session.date === todayKey;
  const day = today ? relativeDayLabel(session.date, todayKey) : weekdayShort.format(new Date(`${session.date}T00:00:00Z`));
  return (
    <Link href={`/calendar/${session.id}`} className={cardClass({ interactive: true, className: "group flex h-full gap-4" })}>
      <span
        className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-control ${
          today ? "bg-brand-soft text-brand-strong" : "bg-info-soft text-info"
        }`}
      >
        <span className="text-label font-bold uppercase tracking-wider">{day}</span>
        <span className="text-xl font-bold leading-6">{Number(session.date.slice(8))}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-bold text-ink">{session.title}</span>
          <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {session.time}–{session.endTime}
          </span>
          <span className="flex items-center gap-1">
            <PinIcon className="h-3.5 w-3.5" />
            {session.place}
          </span>
        </span>
        <span className="mt-1.5 block text-xs font-medium text-ink-soft">{groupName(session.groupId)}</span>
        <span className="mt-1.5 block empty:hidden">
          <SessionBadges session={session} compact />
        </span>
      </span>
    </Link>
  );
}
