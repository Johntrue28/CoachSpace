"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, toDateKey } from "@/data/calendar";
import { coach, colourOf, groupById, groups, sessionWords } from "@/data/groups";
import { sessionsWithoutAttendance } from "@/data/activity";
import { useAttendanceSetting, useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { useRsvp } from "@/data/use-rsvp";
import { COACH_SENDER_ID } from "@/data/messages";
import { agendaDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";
import { useUnreadTotal } from "@/components/chat/UnreadBadge";
import { ChatIcon, ChevronRightIcon, UserCheckIcon } from "@/components/Icons";
import { ChipRow, FilterChip } from "@/components/ui/FilterChip";
import AgendaSessionRow from "./AgendaSessionRow";
import EmptyState from "@/components/ui/EmptyState";
import WeekStrip from "./WeekStrip";
import NextSessionHero from "./NextSessionHero";
import SessionPeek from "./SessionPeek";
import { weekStrip } from "@/data/look";
import type { Session } from "@/data/types";
import DemoGuide from "./DemoGuide";

/** How many days the agenda looks ahead, today included. */
const DAYS = 7;

/**
 * The coach's home (D-071): the next seven days as an agenda, each session with who is coming, as in
 * the team apps coaches already use. One primary action ("New session"), a short list of things that
 * need the coach, and a group filter. The month calendar lives on its own page.
 */
export default function CoachAgenda() {
  const now = useNow();
  const { ready, on, changes, upcoming } = useSessions();
  const { attendance } = useDemoStore();
  const attendanceSetting = useAttendanceSetting();
  const rsvp = useRsvp();
  const unread = useUnreadTotal(COACH_SENDER_ID);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [peek, setPeek] = useState<Session | null>(null);
  const words = sessionWords();

  const today = now ? toDateKey(now) : null;
  const days = useMemo(() => {
    if (!today || !ready) return [];
    return Array.from({ length: DAYS }, (_, i) => {
      const date = addDays(today, i);
      return { date, sessions: on(date).filter((s) => !groupId || s.groupId === groupId) };
    }).filter((d) => d.sessions.length > 0 && (!day || d.date === day));
  }, [today, ready, on, groupId, day]);
  const strip = today && ready ? weekStrip(today, (d) => on(d).filter((s) => !groupId || s.groupId === groupId), DAYS) : [];
  // The next session that has not started, for the big card at the top (D-074).
  const next = now && ready ? upcoming(now, { limit: 1, activeOnly: true, groupIds: groupId ? [groupId] : undefined })[0] : undefined;

  const registers =
    now && ready && attendanceSetting.enabled
      ? sessionsWithoutAttendance(now, changes, attendance, { daysBack: 7 }).reduce((n, g) => n + g.sessionIds.length, 0)
      : 0;
  const total = days.reduce((n, d) => n + d.sessions.filter((s) => s.status !== "cancelled").length, 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6 lg:pt-8">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">{coach.organisation}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Agenda</h1>
        </div>
      </div>

      <div className="mt-4">
        <DemoGuide />
      </div>

      {strip.length > 0 && (
        <div className="mt-4">
          <WeekStrip days={strip} selected={day} onSelect={setDay} />
        </div>
      )}

      {next && now && !day && (
        <div className="mt-4">
          <NextSessionHero session={next} now={now} rsvp={rsvp} />
        </div>
      )}

      {(registers > 0 || unread > 0) && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Needs your attention">
          {registers > 0 && (
            <li>
              <NeedsYou href="/attendance" icon={<UserCheckIcon className="h-5 w-5" />} tone="attention">
                {registers} register{registers === 1 ? "" : "s"} to take
              </NeedsYou>
            </li>
          )}
          {unread > 0 && (
            <li>
              <NeedsYou href="/chat" icon={<ChatIcon className="h-5 w-5" />} tone="brand">
                {unread} unread message{unread === 1 ? "" : "s"}
              </NeedsYou>
            </li>
          )}
        </ul>
      )}

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
          title={day ? `No ${words.many} on this day` : `No ${words.many} in the next ${DAYS} days`}
          description={groupId ? `For ${groupById(groupId)?.name}. Choose “All groups” to see the others.` : "A free day. Add an extra session with +."}
        />
      ) : (
        <div className="mt-5 space-y-6">
          <p className="sr-only">
            {total} {total === 1 ? words.one : words.many} in the next {DAYS} days.
          </p>
          {days.map((day) => (
            <section key={day.date} aria-labelledby={`day-${day.date}`}>
              <h2 id={`day-${day.date}`} className="px-1 text-sm font-bold text-ink">
                {agendaDayLabel(day.date, today)}
              </h2>
              <ul className="mt-2 divide-y divide-line overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line">
                {day.sessions.map((s) => (
                  <li key={s.id}>
                    <AgendaSessionRow session={s} now={now!} rsvp={rsvp} onOpen={setPeek} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {now && <SessionPeek session={peek} now={now} rsvp={rsvp} onClose={() => setPeek(null)} />}

      <div className="mt-6 flex justify-center">
        <Link href="/calendar" className="rounded-control px-3 py-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft">
          Open the month calendar
        </Link>
      </div>
    </main>
  );
}

function NeedsYou({ href, icon, tone, children }: { href: string; icon: React.ReactNode; tone: "attention" | "brand"; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center gap-3 rounded-card bg-card px-3 py-2.5 text-sm font-semibold text-ink shadow-card ring-1 ring-line transition hover:ring-brand/40"
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-control ${tone === "attention" ? "bg-attention-soft text-attention-ink" : "bg-brand-soft text-brand-strong"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
    </Link>
  );
}
