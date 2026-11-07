"use client";

import Link from "next/link";
import { useState } from "react";
import { countdown, sessionPhoto } from "@/data/look";
import { disciplineOf, groupName } from "@/data/groups";
import { sessionStart, toDateKey } from "@/data/calendar";
import { agendaDayLabel } from "@/components/format";
import type { Session } from "@/data/types";
import type { useRsvp } from "@/data/use-rsvp";
import { summaryText } from "@/data/rsvp";
import Photo from "@/components/ui/Photo";
import { LiveStatus } from "@/components/ui/StatusMessage";

const endOf = (s: Session) => sessionStart({ date: s.date, time: s.endTime });

/**
 * The next session as a big card with its sport's photo (D-074): when it starts, who is coming and the two
 * things a coach does before a session — check the list and nudge the people who have not replied.
 * The reminder is prepared in this demo only: nobody is notified.
 */
export default function NextSessionHero({ session, now, rsvp }: { session: Session; now: Date; rsvp: ReturnType<typeof useRsvp> }) {
  const [status, setStatus] = useState("");
  const summary = rsvp.ready ? rsvp.summary(session) : null;
  const total = summary?.total || 1;
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <section aria-labelledby="next-session-title" className="fade-in overflow-hidden rounded-[1.5rem] bg-navy text-on-brand shadow-raised">
      <div className="relative h-36 sm:h-44">
        <Photo name={sessionPhoto(session.id, disciplineOf(session.groupId))} alt="" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/10 via-navy/30 to-navy" aria-hidden="true" />
        <span className="absolute right-3 top-3 rounded-full bg-lime px-2.5 py-1 text-xs font-bold text-on-lime">
          {countdown(now, sessionStart(session), endOf(session))}
        </span>
      </div>
      <div className="relative -mt-8 px-4 pb-4 sm:px-5">
        <p className="text-label font-bold uppercase tracking-wider text-on-brand/85">
          Next session · {agendaDayLabel(session.date, toDateKey(now)).split(" · ")[0]}, {session.time}
        </p>
        <h2 id="next-session-title" className="mt-0.5 text-xl font-bold leading-tight sm:text-2xl">
          {session.title}
        </h2>
        <p className="mt-0.5 text-sm text-on-brand/85">
          {groupName(session.groupId)} · {session.place}
        </p>
        {summary && (
          <>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-on-brand/20" aria-hidden="true">
              <span className="grow-bar bg-lime" style={{ width: pct(summary.going) }} />
              <span className="bg-attention-soft" style={{ width: pct(summary.maybe) }} />
              <span className="bg-danger/70" style={{ width: pct(summary.notGoing) }} />
            </div>
            <p className="mt-1.5 text-sm font-semibold">{summaryText(summary)}</p>
          </>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={`/calendar/${session.id}`} className="press flex min-h-11 items-center justify-center rounded-control bg-card px-3 text-sm font-bold text-brand-strong">
            See who&rsquo;s coming
          </Link>
          {summary && summary.noReply > 0 ? (
            <button
              type="button"
              onClick={() => {
                rsvp.remind(session.id);
                setStatus(`Reminder prepared for ${summary.noReply} (demo): nobody was notified.`);
              }}
              className="press flex min-h-11 items-center justify-center rounded-control bg-on-brand/15 px-3 text-sm font-bold text-on-brand hover:bg-on-brand/25"
            >
              Remind {summary.noReply}
            </button>
          ) : (
            <Link href={`/calendar/${session.id}#plan`} className="press flex min-h-11 items-center justify-center rounded-control bg-on-brand/15 px-3 text-sm font-bold text-on-brand hover:bg-on-brand/25">
              Open the plan
            </Link>
          )}
        </div>
        <LiveStatus message={status} className="mt-2 bg-card" />
      </div>
    </section>
  );
}
