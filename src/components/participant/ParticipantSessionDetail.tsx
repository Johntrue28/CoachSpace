"use client";

import Link from "next/link";
import { useSessions } from "@/data/use-sessions";
import { useDemoStore } from "@/data/store";
import { planForSession, planOutline, totalMinutes } from "@/data/plans";

import { coach, coachRole, DEMO_PARTICIPANT_ID, groupById, groupIdsOf } from "@/data/groups";
import { formatDateKeyFull } from "@/components/format";
import Avatar from "@/components/Avatar";
import { CalendarIcon, ChevronRightIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/Icons";
import SessionBadges from "@/components/calendar/SessionBadges";
import BackLink from "@/components/navigation/BackLink";

/** A session as the participant sees it: details and changes only, no coach controls or notes. */
export default function ParticipantSessionDetail({ id }: { id: string }) {
  const { ready, byId } = useSessions();
  const { plans, exercises } = useDemoStore();
  // Wait for the saved calendar changes (one-off sessions, and dates formatted in the browser).
  const session = ready ? byId(id) : undefined;
  const group = session && groupById(session.groupId);
  // A participant only sees sessions of their own groups.
  if (!session || !group || !groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <BackLink fallback="/me/calendar" fallbackLabel="Calendar" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This session is not available." : "Loading…"}</p>
      </main>
    );
  }
  const cancelled = session.status === "cancelled";
  // The coach's plan for this session, read-only (D-058).
  const plan = cancelled ? undefined : planForSession(plans, session.id);
  const outline = plan ? planOutline(plan, exercises) : [];
  const safetyNote = outline.flatMap((b) => b.items).find((i) => i.safetyNote)?.safetyNote;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback={`/me/calendar?date=${session.date}`} fallbackLabel="Calendar" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-strong">
        {session.kind === "one-off" ? "Extra session" : "Training session"}
      </p>
      <h1 className={`mt-1 text-2xl font-bold ${cancelled ? "text-ink-soft line-through" : ""}`}>{session.title}</h1>
      <div className="mt-2">
        <SessionBadges session={session} />
      </div>
      {cancelled && (
        <p className="mt-2 text-sm text-danger">
          This session will not take place{session.cancelReason ? `: ${session.cancelReason}` : "."}
        </p>
      )}

      <section className="mt-4 space-y-3 rounded-2xl bg-card p-4 text-sm ring-1 ring-line">
        <p className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {formatDateKeyFull(session.date)}
        </p>
        <p className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {session.time}–{session.endTime}
        </p>
        <p className="flex items-center gap-2">
          <PinIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {session.place}
        </p>
        <p className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {coachRole()}: {coach.name}
        </p>
      </section>

      {plan && outline.length > 0 && (
        <section aria-labelledby="session-plan" className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
          <h2 id="session-plan" className="font-bold">
            Session plan
          </h2>
          <p className="text-xs text-ink-soft">
            Your {coachRole().toLowerCase()}’s plan for this session · {totalMinutes(plan)} min
          </p>
          {outline.map((b) => (
            <div key={b.id} className="mt-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-planning">{b.label}</h3>
              <ol className="mt-1 divide-y divide-line">
                {b.items.map((i) => (
                  <li key={i.id} className="py-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">{i.title}</p>
                      <span className="shrink-0 text-xs text-ink-soft">{i.minutes} min</span>
                    </div>
                    {i.text && <p className="mt-0.5 text-xs text-ink-soft">{i.text}</p>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          {safetyNote && <p className="mt-3 rounded-lg bg-surface p-3 text-xs text-ink">{safetyNote}</p>}
        </section>
      )}

      <Link
        href={`/me/groups/${group.id}`}
        className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line hover:ring-brand"
      >
        <Avatar name={group.name} />
        <p className="min-w-0 flex-1 font-semibold">{group.name}</p>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
      </Link>

      <p className="mt-6 text-center text-xs text-ink-soft">
        Demo schedule with fictional sessions. No reminders are sent.
      </p>
    </main>
  );
}
