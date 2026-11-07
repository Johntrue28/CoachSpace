"use client";

import Link from "next/link";
import { sessionStart } from "@/data/calendar";
import { colourOf, groupById } from "@/data/groups";
import type { Session } from "@/data/types";
import type { useRsvp } from "@/data/use-rsvp";
import { ChevronRightIcon } from "@/components/Icons";
import SessionBadges from "@/components/calendar/SessionBadges";
import RsvpBar from "@/components/rsvp/RsvpBar";

/**
 * One session as a row (D-071): time, a state bar, title, group and place, changes and — for the
 * coach — who is coming. Used on Home and in the calendar.
 */
export default function SessionRow({
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
  const className = "press flex w-full items-stretch gap-3 px-4 py-3.5 text-left transition hover:bg-surface";
  const content = (
    <>
      <div className={`w-12 shrink-0 tabular-nums ${cancelled || started ? "text-ink-soft" : "text-ink"}`}>
        <p className="text-sm font-bold">{session.time}</p>
        <p className="text-xs text-ink-soft">{session.endTime}</p>
      </div>
      <div
        className={`w-1 shrink-0 rounded-full ${cancelled ? "bg-danger/40" : started ? "bg-line-strong" : ""}`}
        style={cancelled || started ? undefined : { backgroundColor: colourOf(session.groupId).solid }}
        aria-hidden="true"
      />
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
    </>
  );
  // The whole row opens the session page (D-076).
  return (
    <Link href={`${basePath}/${session.id}`} className={className}>
      {content}
    </Link>
  );
}
