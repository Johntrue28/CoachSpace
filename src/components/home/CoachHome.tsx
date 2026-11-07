"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, toDateKey } from "@/data/calendar";
import { coach, colourOf, groupById, groups } from "@/data/groups";
import { sessionsWithoutAttendance } from "@/data/attendance";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { useRsvp } from "@/data/use-rsvp";
import { agendaDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";
import { ChevronRightIcon, UserCheckIcon } from "@/components/Icons";
import { ChipRow, FilterChip } from "@/components/ui/FilterChip";
import EmptyState from "@/components/ui/EmptyState";
import PinnedAnnouncement from "@/components/announcements/PinnedAnnouncement";
import SessionRow from "./SessionRow";
import NextSessionHero from "./NextSessionHero";
import DemoGuide from "./DemoGuide";

/** How many days Home looks ahead, today included. */
const DAYS = 7;

/**
 * The coach's Home (D-071, D-076): the latest announcement, the next session as a big card, the registers to
 * take, then the rest of the next seven days by day — each row opens the session page.
 */
export default function CoachHome() {
  const now = useNow();
  const { ready, on, changes, upcoming } = useSessions();
  const { attendance } = useDemoStore();
  const rsvp = useRsvp();
  const [groupId, setGroupId] = useState<string | null>(null);

  const today = now ? toDateKey(now) : null;
  // The next session that has not started, for the big card at the top (D-074).
  const next = now && ready ? upcoming(now, { limit: 1, activeOnly: true, groupIds: groupId ? [groupId] : undefined })[0] : undefined;
  // The list starts after that session, so nothing is shown twice (D-076).
  const days = useMemo(() => {
    if (!today || !ready) return [];
    return Array.from({ length: DAYS }, (_, i) => {
      const date = addDays(today, i);
      return { date, sessions: on(date).filter((s) => (!groupId || s.groupId === groupId) && s.id !== next?.id) };
    }).filter((d) => d.sessions.length > 0);
  }, [today, ready, on, groupId, next?.id]);

  const registers =
    now && ready
      ? sessionsWithoutAttendance(now, changes, attendance, { daysBack: 7 }).reduce((n, g) => n + g.sessionIds.length, 0)
      : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6 lg:pt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">{coach.organisation}</p>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Home</h1>

      <div className="mt-4 space-y-4">
        <DemoGuide />
        <PinnedAnnouncement viewer="coach" />
        {next && now && <NextSessionHero session={next} now={now} rsvp={rsvp} />}
        {registers > 0 && (
          <Link
            href="/attendance"
            className="flex min-h-12 items-center gap-3 rounded-card bg-card px-3 py-2.5 text-sm font-semibold text-ink shadow-card ring-1 ring-line transition hover:ring-brand/40"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-attention-soft text-attention-ink">
              <UserCheckIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 truncate">
              {registers} register{registers === 1 ? "" : "s"} to take
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
          </Link>
        )}
      </div>

      <ChipRow label="Show groups" className="mt-5">
        <FilterChip active={groupId === null} onClick={() => setGroupId(null)}>
          All groups
        </FilterChip>
        {groups.map((g) => (
          <FilterChip key={g.id} active={groupId === g.id} onClick={() => setGroupId(groupId === g.id ? null : g.id)}>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colourOf(g.id).solid }} aria-hidden="true" />
            {g.name}
          </FilterChip>
        ))}
      </ChipRow>

      {!today || !ready ? (
        <p className="mt-8 text-sm text-ink-soft">Loading your week…</p>
      ) : days.length === 0 ? (
        <EmptyState
          className="mt-5"
          title={next ? `Nothing else in the next ${DAYS} days` : `No sessions in the next ${DAYS} days`}
          description={groupId ? `For ${groupById(groupId)?.name}. Choose “All groups” to see the others.` : "Add an extra session with +."}
        />
      ) : (
        <div className="mt-5 space-y-6">
          {days.map((day) => (
            <section key={day.date} aria-labelledby={`day-${day.date}`}>
              <h2 id={`day-${day.date}`} className="px-1 text-sm font-bold text-ink">
                {agendaDayLabel(day.date, today)}
              </h2>
              <ul className="mt-2 divide-y divide-line overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line">
                {day.sessions.map((s) => (
                  <li key={s.id}>
                    <SessionRow session={s} now={now!} rsvp={rsvp} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
