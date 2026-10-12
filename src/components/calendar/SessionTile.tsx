import Link from "next/link";
import { ChevronRightIcon, ClockIcon, PinIcon } from "@/components/Icons";
import { relativeDayLabel } from "@/components/format";
import { cardClass } from "@/components/ui/Card";
import { groupName } from "@/data/groups";
import type { Session } from "@/data/types";
import SessionBadges from "./SessionBadges";

const weekdayShort = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

/**
 * A session as a date card (Figma "SessionCard"): the day in a tile, then title, time, place and
 * group. Today's sessions use the brand colours, other days the calendar blue.
 */
export default function SessionTile({ session, todayKey, href }: { session: Session; todayKey: string; href: string }) {
  const today = session.date === todayKey;
  const day = today ? relativeDayLabel(session.date, todayKey) : weekdayShort.format(new Date(`${session.date}T00:00:00Z`));
  return (
    <Link href={href} className={cardClass({ interactive: true, className: "group flex h-full gap-4" })}>
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
