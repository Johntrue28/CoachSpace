"use client";

import Link from "next/link";
import { useState } from "react";
import type { Session } from "@/data/types";
import type { useRsvp } from "@/data/use-rsvp";
import { colourOf, disciplineOf, groupName } from "@/data/groups";
import { countdown, sessionPhoto } from "@/data/look";
import { membersByAnswer, RSVP_GROUP_LABEL } from "@/data/rsvp";
import { sessionStart, toDateKey } from "@/data/calendar";
import { agendaDayLabel } from "@/components/format";
import Sheet from "@/components/ui/Sheet";
import Photo from "@/components/ui/Photo";
import Avatar from "@/components/Avatar";
import RsvpBar from "@/components/rsvp/RsvpBar";
import SessionBadges from "@/components/calendar/SessionBadges";
import { buttonClass } from "@/components/ui/Button";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { PinIcon } from "@/components/Icons";

const mark: Record<string, string> = { going: "✓", maybe: "?", "not-going": "✕", none: "·" };
const markColour: Record<string, string> = { going: "text-success", maybe: "text-attention-ink", "not-going": "text-danger", none: "text-ink-soft" };

/**
 * A session as a sheet that rises from the bottom (D-074): the coach sees it at a glance from the Agenda
 * without leaving it, and opens the full session page from here. The reminder is a demo: nobody is notified.
 */
export default function SessionPeek({ session, now, rsvp, onClose }: { session: Session | null; now: Date; rsvp: ReturnType<typeof useRsvp>; onClose: () => void }) {
  const [status, setStatus] = useState("");
  const s = session;
  const summary = s && rsvp.ready ? rsvp.summary(s) : null;
  const groups = s && rsvp.ready ? membersByAnswer(rsvp.answers(s), s.groupId) : [];
  const cancelled = s?.status === "cancelled";
  const past = s ? sessionStart(s) <= now : false;
  return (
    <Sheet
      open={Boolean(s)}
      onClose={() => {
        setStatus("");
        onClose();
      }}
      title={s?.title ?? ""}
    >
      {s && (
        <div>
          <div className="relative -mx-4 -mt-1 h-28 overflow-hidden sm:mx-0 sm:rounded-control">
            <Photo name={sessionPhoto(s.id, disciplineOf(s.groupId))} alt="" />
            <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-on-brand" style={{ backgroundColor: colourOf(s.groupId).solid }}>
              {groupName(s.groupId)}
            </span>
            {!cancelled && !past && (
              <span className="absolute right-3 top-3 rounded-full bg-lime px-2.5 py-1 text-xs font-bold text-on-lime">{countdown(now, sessionStart(s))}</span>
            )}
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">
            {agendaDayLabel(s.date, toDateKey(now))} · {s.time}–{s.endTime}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft">
            <PinIcon className="h-4 w-4" /> {s.place}
          </p>
          <div className="mt-2 empty:hidden">
            <SessionBadges session={s} compact />
          </div>
          {summary && !cancelled && (
            <div className="mt-3">
              <RsvpBar summary={summary} />
              <ul className="mt-3 max-h-48 divide-y divide-line overflow-y-auto rounded-control ring-1 ring-line" aria-label="Who's coming">
                {groups.flatMap((g) =>
                  g.members.map((p) => (
                    <li key={p.id} className="flex items-center gap-2.5 px-3 py-2">
                      <Avatar name={p.name} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.name}</span>
                      <span className={`text-sm font-bold ${markColour[g.key]}`} aria-label={RSVP_GROUP_LABEL[g.key]}>
                        {mark[g.key]}
                      </span>
                    </li>
                  )),
                )}
              </ul>
            </div>
          )}
          <div className="mt-4 grid gap-2">
            <Link href={`/calendar/${s.id}`} className={buttonClass({ size: "lg", block: true })}>
              Open {s.title.length > 22 ? "the session" : s.title}
            </Link>
            {summary && summary.noReply > 0 && !past && !cancelled && (
              <button
                type="button"
                onClick={() => {
                  rsvp.remind(s.id);
                  setStatus(`Reminder prepared for ${summary.noReply} (demo): nobody was notified.`);
                }}
                className={buttonClass({ variant: "secondary", block: true })}
              >
                Remind {summary.noReply} who haven&rsquo;t replied
              </button>
            )}
            {past && !cancelled && (
              <Link href={`/calendar/${s.id}/attendance?group=${s.groupId}`} className={buttonClass({ variant: "secondary", block: true })}>
                Take attendance
              </Link>
            )}
          </div>
          <LiveStatus message={status} className="mt-2" />
        </div>
      )}
    </Sheet>
  );
}
