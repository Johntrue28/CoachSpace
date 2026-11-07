"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import type { Session } from "@/data/types";
import { useSessions } from "@/data/use-sessions";

import { coach, DEMO_PARTICIPANT_ID, groupById, groupIdsOf, memberCount, participantById, participantsLabel } from "@/data/groups";
import { sessionState } from "@/data/calendar";
import { formatDateKeyFull } from "@/components/format";
import Avatar from "@/components/Avatar";
import { inputClass } from "@/components/Form";
import { CalendarIcon, ChevronRightIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/Icons";
import SessionAttendance from "@/components/attendance/SessionAttendance";
import SessionPlanCard from "@/components/plans/SessionPlanCard";
import CoachNotes from "@/components/notes/CoachNotes";
import PreviousNotes from "@/components/notes/PreviousNotes";
import SessionBadges from "./SessionBadges";
import ParticipantSessionSummary from "@/components/participant/ParticipantSessionSummary";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";
import { buttonClass } from "@/components/ui/Button";
import { LiveStatus } from "@/components/ui/StatusMessage";
import WhosComing from "@/components/rsvp/WhosComing";

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
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <BackLink fallback="/calendar" fallbackLabel="Calendar" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This session was not found." : "Loading…"}</p>
      </main>
    );
  }
  const cancelled = session.status === "cancelled";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/" fallbackLabel="Agenda" />

      <LiveStatus message={status} className="mt-4" />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-strong">
        {session.kind === "one-off" ? "Extra session" : "Training session"}
      </p>
      <h1 className={`mt-1 text-2xl font-bold ${cancelled ? "text-ink-soft line-through" : ""}`}>{session.title}</h1>
      <div className="mt-2">
        <SessionBadges session={session} />
      </div>
      {cancelled && session.cancelReason && <p className="mt-2 text-sm text-danger">Reason: {session.cancelReason}</p>}

      <section className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2.5 rounded-card bg-card p-4 text-sm shadow-card ring-1 ring-line sm:grid-cols-2">
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
          <UsersIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {group.name} · Coach: {coach.name}
        </p>
      </section>

      {!cancelled && <WhosComing session={session} />}



      {sessionState(session) !== "regular" && <ParticipantPreview session={session} groupName={group.name} />}

      <Link
        href={`/groups/${group.id}`}
        className="mt-4 flex items-center gap-3 rounded-card bg-card p-4 shadow-card ring-1 ring-line hover:ring-brand"
      >
        <Avatar name={group.name} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{group.name}</p>
          <p className="text-sm text-ink-soft">
            {group.discipline} · {participantsLabel(memberCount(group.id))}
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

      <section className="mt-4 rounded-card bg-card p-4 shadow-card ring-1 ring-line" aria-labelledby="manage-session">
        <h2 id="manage-session" className="mb-3 text-lg font-bold text-ink">Change this session</h2>
        {cancelled ? (
          <button
            type="button"
            onClick={() => {
              restoreSession(session.id);
              setStatus("Session restored on this device.");
            }}
            className={buttonClass({ block: true })}
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
              <button type="button" onClick={() => setConfirming(false)} className={buttonClass({ variant: "secondary" })}>
                Keep session
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelSession(session.id, reason);
                  setConfirming(false);
                  setStatus("Session cancelled on this device. The weekly schedule is unchanged. Participants have not been notified (demo): the preview below shows what they would see.");
                }}
                className={buttonClass({ variant: "danger" })}
              >
                Cancel session
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/calendar/${session.id}/edit`}
              className={buttonClass({ variant: "secondary" })}
            >
              Reschedule or move
            </Link>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={buttonClass({ variant: "danger-soft" })}
            >
              Cancel this session
            </button>
          </div>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-ink-soft">
        Demo schedule with fictional sessions. Nothing is synced with an external calendar.
      </p>
    </main>
  );
}

/**
 * After a change (cancelled, moved, new place, extra session): the session exactly as the group's
 * participants would see it, clearly labelled as a preview (audit R-04). Nothing is sent; the
 * participant view of the same session is one tap away when the demo participant is in the group.
 */
function ParticipantPreview({ session, groupName }: { session: Session; groupName: string }) {
  const member = groupIdsOf(DEMO_PARTICIPANT_ID).includes(session.groupId);
  const participant = participantById(DEMO_PARTICIPANT_ID)?.name;
  return (
    <section aria-labelledby="participant-preview" className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
      <h2 id="participant-preview" className="font-bold">
        What participants would see — demo preview
      </h2>
      <p className="mt-0.5 text-xs text-ink-soft">
        Nothing has been sent to anyone. This is how the session would look to the participants of {groupName} in their
        calendar: the change is written once, not repeated in every chat.
      </p>
      <div className="mt-3 rounded-xl border border-dashed border-line p-3" data-preview>
        <ParticipantSessionSummary session={session} preview />
      </div>
      {member ? (
        <Link href={`/me/calendar/${session.id}`} className={buttonClass({ variant: "secondary", block: true, className: "mt-3" })}>
          Open {participant}’s view of this session
        </Link>
      ) : (
        <p className="mt-3 text-xs text-ink-soft">
          The participant view in this demo follows {participant}, who is not in {groupName}.
        </p>
      )}
    </section>
  );
}
