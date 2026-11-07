"use client";

import { useState } from "react";
import Link from "next/link";
import type { Group } from "@/data/types";
import { colourOf, participantsOf, sessionWords } from "@/data/groups";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { useRsvp } from "@/data/use-rsvp";
import { useNow } from "@/components/useNow";
import { agendaDayLabel } from "@/components/format";
import { toDateKey } from "@/data/calendar";
import { seasonOf, seededClaps } from "@/data/season";
import { RSVP_GROUP_LABEL, summaryText } from "@/data/rsvp";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { listClass } from "@/components/ui/Card";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { SearchIcon, UserPlusIcon } from "@/components/Icons";

const mark = { going: "✓", maybe: "?", "not-going": "✕", none: "·" } as const;
const markClass = { going: "text-success", maybe: "text-attention-ink", "not-going": "text-danger", none: "text-ink-soft" } as const;

/**
 * The group's players (D-074): who is coming to the next session, each player's attendance and streak, and
 * a clap from the coach (like Strava's kudos). Claps are saved in this browser only: nobody is notified.
 */
export default function PlayersPanel({ group, onAdd }: { group: Group; onAdd: () => void }) {
  const { attendance, claps, clap } = useDemoStore();
  const { ready, upcoming } = useSessions();
  const rsvp = useRsvp();
  const now = useNow();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const members = participantsOf(group.id);
  const next = now && ready ? upcoming(now, { groupId: group.id, limit: 1, activeOnly: true })[0] : undefined;
  const answers = next && rsvp.ready ? rsvp.answers(next) : {};
  const q = query.trim().toLowerCase();
  const shown = q ? members.filter((p) => `${p.name} ${p.detail}`.toLowerCase().includes(q)) : members;
  const colour = colourOf(group.id);

  return (
    <section aria-labelledby="players-heading">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="players-heading" className="text-base font-bold text-ink">
            {next && now ? `Next ${sessionWords().one}: ${agendaDayLabel(next.date, toDateKey(now)).split(" · ")[0]}, ${next.time}` : "Players"}
          </h2>
          {next && rsvp.ready && (
            <Link href={`/calendar/${next.id}`} className="text-sm font-semibold text-brand-strong hover:underline">
              {summaryText(rsvp.summary(next))}
            </Link>
          )}
        </div>
        <button type="button" onClick={onAdd} className="press flex min-h-11 shrink-0 items-center gap-1.5 rounded-control px-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft">
          <UserPlusIcon className="h-4 w-4" /> Add member
        </button>
      </div>

      {members.length > 6 && (
        <label className="mt-3 flex min-h-11 items-center gap-2 rounded-control bg-card px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
          <SearchIcon className="h-4 w-4 text-ink-soft" />
          <span className="sr-only">Search participants</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or level" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft" />
        </label>
      )}

      <LiveStatus message={status} className="mt-3" />
      {members.length === 0 ? (
        <EmptyState className="mt-3" title="No members yet" description="Add them here or share the invite link." />
      ) : shown.length === 0 ? (
        <p className="mt-3 rounded-card bg-card p-6 text-center text-sm text-ink-soft ring-1 ring-line">No participants match “{query}”.</p>
      ) : (
        <ul className={listClass("mt-3")} aria-label="Players">
          {shown.map((p) => {
            const season = seasonOf(p.id, attendance.filter((r) => r.groupId === group.id));
            const answer = next ? (answers[p.id] ?? "none") : null;
            const total = seededClaps(p.id) + (claps[p.id] ?? 0);
            return (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={p.name} size="sm" colour={colour} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {season.rate !== null ? `Attendance ${season.rate}%` : p.detail}
                    {season.streak > 1 && ` · 🔥 ${season.streak}`}
                    {p.guardian && ` · Guardian: ${p.guardian}`}
                  </p>
                </div>
                {answer && (
                  <span className={`w-5 text-center text-base font-bold ${markClass[answer]}`} title={RSVP_GROUP_LABEL[answer]}>
                    <span aria-hidden="true">{mark[answer]}</span>
                    <span className="sr-only">{RSVP_GROUP_LABEL[answer]}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    clap(p.id);
                    setStatus(`You clapped ${p.name.split(" ")[0]} (demo: saved in this browser, nobody is notified).`);
                  }}
                  aria-label={`Clap ${p.name}, ${total} claps so far`}
                  className="press flex min-h-11 min-w-14 items-center justify-center gap-1 rounded-full bg-surface px-2.5 text-sm font-bold text-ink ring-1 ring-inset ring-line hover:bg-brand-soft"
                >
                  <span aria-hidden="true">👏</span> {total}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
