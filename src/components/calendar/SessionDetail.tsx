"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";

import { coach, groupById, memberCount } from "@/data/groups";
import { formatDateKeyFull } from "@/components/format";
import Avatar from "@/components/Avatar";
import { inputClass } from "@/components/Form";
import { CalendarIcon, ChevronRightIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/Icons";
import SessionAttendance from "@/components/attendance/SessionAttendance";
import SessionPlanCard from "@/components/plans/SessionPlanCard";
import CoachNotes from "@/components/notes/CoachNotes";
import PreviousNotes from "@/components/notes/PreviousNotes";
import SessionBadges from "./SessionBadges";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";

/** A session as the coach sees it, with calendar changes, plan, attendance and notes. */
export default function SessionDetail({ id }: { id: string }) {
  const { ready, byId } = useSessions();
  const { cancelSession, restoreSession } = useDemoStore();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const flash = useFlashMessage();
  const [actionStatus, setStatus] = useState("");
  const status = actionStatus || flash;

  // Wait for the saved calendar changes, so the server and the browser render the same thing
  // (dates are formatted in the browser) and one-off sessions can be found.
  const session = ready ? byId(id) : undefined;
  const group = session && groupById(session.groupId);
  if (!session || !group) {
    return (
      <main className="px-4 pt-8">
        <BackLink fallback="/calendar" fallbackLabel="Calendar" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This session was not found." : "Loading…"}</p>
      </main>
    );
  }
  const cancelled = session.status === "cancelled";

  return (
    <main className="px-4 pt-6">
      <BackLink fallback={`/calendar?date=${session.date}`} fallbackLabel="Calendar" />

      <p role="status" aria-live="polite" className={status ? "mt-4 rounded-xl bg-brand-soft px-3 py-2 text-sm font-medium text-brand" : "sr-only"}>
        {status}
      </p>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand">
        {session.kind === "one-off" ? "Extra session" : "Training session"}
      </p>
      <h1 className={`mt-1 text-2xl font-bold ${cancelled ? "text-ink-soft line-through" : ""}`}>{session.title}</h1>
      <div className="mt-2">
        <SessionBadges session={session} />
      </div>
      {cancelled && session.cancelReason && <p className="mt-2 text-sm text-red-700">Reason: {session.cancelReason}</p>}

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

      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line" aria-label="Manage this session">
        {cancelled ? (
          <button
            type="button"
            onClick={() => {
              restoreSession(session.id);
              setStatus("Session restored on this device.");
            }}
            className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
          >
            Restore this session
          </button>
        ) : confirming ? (
          <div className="space-y-3">
            <label className="block text-sm font-semibold">
              Reason (optional)
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={120}
                placeholder="e.g. Pitch closed for maintenance"
                className={`${inputClass} mt-1.5 font-normal`}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 ring-line">
                Keep session
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelSession(session.id, reason);
                  setConfirming(false);
                  setStatus("Session cancelled on this device. The weekly schedule is unchanged. Participants have not been notified (demo).");
                }}
                className="rounded-xl bg-red-700 px-3 py-2.5 text-sm font-semibold text-white"
              >
                Cancel session
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/calendar/${session.id}/edit`}
              className="rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-brand ring-1 ring-line"
            >
              Reschedule or move
            </Link>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-line"
            >
              Cancel this session
            </button>
          </div>
        )}
      </section>

      <Link
        href={`/groups/${group.id}`}
        className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line hover:ring-brand"
      >
        <Avatar name={group.name} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{group.name}</p>
          <p className="text-sm text-ink-soft">
            {group.discipline} · {memberCount(group.id)} participants
          </p>
        </div>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
      </Link>

      {!cancelled && (
        <>
          <PreviousNotes groupId={group.id} before={session} />
          <SessionPlanCard session={session} />
          <SessionAttendance sessionId={session.id} groupId={session.groupId} />
          <CoachNotes session={session} />
        </>
      )}

      <p className="mt-6 text-center text-xs text-ink-soft">
        Demo schedule with fictional sessions. Nothing is synced with an external calendar.
      </p>
    </main>
  );
}
