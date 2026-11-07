"use client";

import { useState } from "react";
import type { Session } from "@/data/types";
import { membersByAnswer, RSVP_GROUP_LABEL } from "@/data/rsvp";
import { useRsvp } from "@/data/use-rsvp";
import { sessionStart } from "@/data/calendar";
import { formatPosted } from "@/components/format";
import Avatar from "@/components/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { LiveStatus } from "@/components/ui/StatusMessage";
import RsvpBar from "./RsvpBar";

const dot: Record<string, string> = { going: "bg-brand", maybe: "bg-attention", "not-going": "bg-danger", none: "bg-line-strong" };

/**
 * "Who's coming" on the coach's session page (D-071): the count, the members by answer and a reminder
 * for those who have not replied. The reminder is only prepared in this demo: nobody is notified.
 */
export default function WhosComing({ session }: { session: Session }) {
  const rsvp = useRsvp();
  const [status, setStatus] = useState("");
  const [showAll, setShowAll] = useState(false);
  if (!rsvp.ready) return <section className="mt-4 rounded-card bg-card p-4 text-sm text-ink-soft ring-1 ring-line">Loading answers…</section>;

  const answers = rsvp.answers(session);
  const summary = rsvp.summary(session);
  const byAnswer = membersByAnswer(answers, session.groupId);
  const upcoming = sessionStart(session) > new Date();
  const remindedAt = rsvp.remindedAt(session.id);
  const visible = showAll ? byAnswer : byAnswer.map((g) => ({ ...g, members: g.members.slice(0, 6) }));
  const hidden = byAnswer.reduce((n, g) => n + Math.max(0, g.members.length - 6), 0);

  return (
    <section aria-labelledby="whos-coming" className="mt-4 rounded-card bg-card p-4 shadow-card ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <h2 id="whos-coming" className="text-lg font-bold text-ink">
          Who&rsquo;s coming
        </h2>
        <span className="text-sm tabular-nums text-ink-soft">{summary.total} in the group</span>
      </div>
      <div className="mt-3">
        <RsvpBar summary={summary} />
      </div>

      {upcoming && summary.noReply > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              rsvp.remind(session.id);
              setStatus(`Reminder prepared for ${summary.noReply} ${summary.noReply === 1 ? "person" : "people"} (demo): nobody was notified.`);
            }}
            className={buttonClass({ variant: "secondary", block: true })}
          >
            Remind {summary.noReply} who haven&rsquo;t replied
          </button>
          {remindedAt && !status && (
            <p className="mt-1.5 text-xs text-ink-soft">Last reminder prepared {formatPosted(remindedAt)} (demo, not sent).</p>
          )}
          <LiveStatus message={status} className="mt-2" />
        </div>
      )}

      <div className="mt-4 space-y-4">
        {visible.map((g) => (
          <div key={g.key}>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <span className={`h-2 w-2 rounded-full ${dot[g.key]}`} aria-hidden="true" />
              {RSVP_GROUP_LABEL[g.key]} · {byAnswer.find((x) => x.key === g.key)!.members.length}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {g.members.map((p) => (
                <li key={p.id} className="flex items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-3 text-sm text-ink">
                  <Avatar name={p.name} size="sm" />
                  {p.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <button type="button" onClick={() => setShowAll(true)} className="mt-3 text-sm font-semibold text-brand-strong hover:underline">
          Show {hidden} more
        </button>
      )}
      <p className="mt-4 text-xs text-ink-soft">Answers of the fictional members are part of the demo; answers you give as the player are saved in this browser.</p>
    </section>
  );
}
