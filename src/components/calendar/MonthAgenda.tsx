"use client";

import { useState } from "react";
import { hasEarlierDays, monthAgendaDays } from "@/data/calendar";
import type { Session } from "@/data/types";
import { useRsvp } from "@/data/use-rsvp";
import { agendaDayLabel } from "@/components/format";
import { listClass } from "@/components/ui/Card";
import AgendaSessionRow from "@/components/agenda/AgendaSessionRow";
import EmptyState from "@/components/ui/EmptyState";

/**
 * The month as an agenda on phones (R8): the days with sessions, from today in the current month, each
 * session as the same row as the Agenda home. The month grid is shown instead from 768 px.
 */
export default function MonthAgenda({
  month,
  today,
  now,
  sessionsOf,
  basePath,
  canManage,
  noGroups,
}: {
  month: string;
  today: string;
  now: Date;
  sessionsOf: (date: string) => Session[];
  basePath: string;
  canManage: boolean;
  noGroups: boolean;
}) {
  const [earlier, setEarlier] = useState(false);
  const rsvp = useRsvp();
  const days = monthAgendaDays(month, today, { earlier })
    .map((date) => ({ date, sessions: sessionsOf(date) }))
    .filter((d) => d.sessions.length > 0);

  return (
    <div>
      {hasEarlierDays(month, today) && (
        <button
          type="button"
          onClick={() => setEarlier((e) => !e)}
          aria-expanded={earlier}
          className="mb-3 min-h-11 rounded-control px-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft"
        >
          {earlier ? "Hide earlier days" : "Show earlier days this month"}
        </button>
      )}
      {days.length === 0 ? (
        <EmptyState title={noGroups ? "No groups selected." : `No sessions ${hasEarlierDays(month, today) && !earlier ? "left this month" : "this month"}.`} />
      ) : (
        <div className="space-y-5">
          {days.map((day) => (
            <section key={day.date} aria-labelledby={`agenda-${day.date}`}>
              <h3 id={`agenda-${day.date}`} className="px-1 text-sm font-bold text-ink">
                {agendaDayLabel(day.date, today)}
              </h3>
              <ul className={listClass("mt-2")}>
                {day.sessions.map((s) => (
                  <li key={s.id}>
                    <AgendaSessionRow session={s} now={now} rsvp={canManage ? rsvp : undefined} basePath={basePath} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
