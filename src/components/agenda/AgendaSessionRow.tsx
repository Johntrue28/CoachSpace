"use client";

import Link from "next/link";
import { sessionStart } from "@/data/calendar";
import { groupById } from "@/data/groups";
import type { Session } from "@/data/types";
import type { useRsvp } from "@/data/use-rsvp";
import { ChevronRightIcon } from "@/components/Icons";
import SessionBadges from "@/components/calendar/SessionBadges";
import RsvpBar from "@/components/rsvp/RsvpBar";

/**
 * One session as an agenda row (D-071): time, a state bar, title, group and place, changes and — for the
 * coach — who is coming. Used by the Agenda home and by the calendar's agenda on phones (R8).
 */
export default function AgendaSessionRow({
  session,
  now,
  rsvp,
  basePath = "/calendar",
}: {
  session: Session;
  now: Date;
  /** The coach's answers; leave out for the participant. */
  rsvp?: ReturnType<typeof useRsvp>;
  basePath?: string;
}) {
  const cancelled = session.status === "cancelled";
  const started = sessionStart(session) <= now;
  const summary = rsvp?.ready ? rsvp.summary(session) : null;
  return (
    <Link href={`${basePath}/${session.id}`} className="flex items-stretch gap-3 px-4 py-3.5 transition hover:bg-surface">
      <div className={`w-12 shrink-0 tabular-nums ${cancelled || started ? "text-ink-soft" : "text-ink"}`}>
        <p className="text-sm font-bold">{session.time}</p>
        <p className="text-xs text-ink-soft">{session.endTime}</p>
      </div>
      <div className={`w-1 shrink-0 rounded-full ${cancelled ? "bg-danger/40" : started ? "bg-line-strong" : "bg-brand"}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${cancelled ? "text-ink-soft line-through" : "text-ink"}`}>{session.title}</p>
        <p className="truncate text-sm text-ink-soft">
          {groupById(session.groupId)?.name} · {session.place}
        </p>
        <div className="mt-1.5 empty:hidden">
          <SessionBadges session={session} compact />
        </div>
        {!cancelled && summary && (
          <div className="mt-2 max-w-xs">
            <RsvpBar summary={summary} compact />
          </div>
        )}
      </div>
      <ChevronRightIcon className="h-5 w-5 shrink-0 self-center text-ink-muted" />
    </Link>
  );
}
