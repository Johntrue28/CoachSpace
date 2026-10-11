"use client";

import Link from "next/link";
import { useSessions } from "@/data/use-sessions";

import { coach, DEMO_PARTICIPANT_ID, groupById, groupIdsOf } from "@/data/groups";
import { formatDateKeyFull } from "@/components/format";
import Avatar from "@/components/Avatar";
import { CalendarIcon, ChevronRightIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/Icons";
import SessionBadges from "@/components/calendar/SessionBadges";
import BackLink from "@/components/navigation/BackLink";

/** A session as the participant sees it: details and changes only, no coach controls or notes. */
export default function ParticipantSessionDetail({ id }: { id: string }) {
  const { ready, byId } = useSessions();
  // Wait for the saved calendar changes (one-off sessions, and dates formatted in the browser).
  const session = ready ? byId(id) : undefined;
  const group = session && groupById(session.groupId);
  // A participant only sees sessions of their own groups.
  if (!session || !group || !groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id)) {
    return (
      <main className="px-4 pt-8">
        <BackLink fallback="/me/calendar" fallbackLabel="Calendar" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This session is not available." : "Loading…"}</p>
      </main>
    );
  }
  const cancelled = session.status === "cancelled";

  return (
    <main className="px-4 pt-6">
      <BackLink fallback={`/me/calendar?date=${session.date}`} fallbackLabel="Calendar" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand">
        {session.kind === "one-off" ? "Extra session" : "Training session"}
      </p>
      <h1 className={`mt-1 text-2xl font-bold ${cancelled ? "text-ink-soft line-through" : ""}`}>{session.title}</h1>
      <div className="mt-2">
        <SessionBadges session={session} />
      </div>
      {cancelled && (
        <p className="mt-2 text-sm text-red-700">
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
          <UsersIcon className="h-5 w-5 shrink-0 text-ink-soft" /> Coach: {coach.name}
        </p>
      </section>

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
