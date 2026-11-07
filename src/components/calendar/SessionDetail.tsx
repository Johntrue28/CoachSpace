"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { DEMO_PARTICIPANT_ID, groupById, groupIdsOf } from "@/data/groups";
import { inputClass } from "@/components/Form";
import SessionAttendance from "@/components/attendance/SessionAttendance";
import SessionPlanCard from "@/components/plans/SessionPlanCard";
import SessionNotes from "@/components/notes/SessionNotes";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";
import { buttonClass } from "@/components/ui/Button";
import { LiveStatus } from "@/components/ui/StatusMessage";
import WhosComing from "@/components/rsvp/WhosComing";
import SessionHeader from "./SessionHeader";

const linkBase = "inline-flex min-h-11 items-center px-2 text-sm font-semibold hover:underline";
const smallLink = `${linkBase} text-brand-strong`;

/**
 * A session as the coach sees it (D-076), in this order: the details, Who's coming, the plan (read-only), the
 * register, the notes, then small links to change the session or see it as a player.
 */
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
        <BackLink fallback="/" fallbackLabel="Home" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This session was not found." : "Loading…"}</p>
      </main>
    );
  }
  const cancelled = session.status === "cancelled";
  const playerCanSee = groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/" fallbackLabel="Home" />
      <LiveStatus message={status} className="mt-4" />
      <SessionHeader session={session} />

      {!cancelled && (
        <>
          <WhosComing session={session} />
          <SessionPlanCard session={session} viewer="coach" />
          <SessionAttendance session={session} />
          <SessionNotes session={session} />
        </>
      )}

      {confirming ? (
        <section aria-labelledby="cancel-heading" className="mt-6 rounded-card bg-card p-4 shadow-card ring-1 ring-line">
          <h2 id="cancel-heading" className="font-bold text-ink">
            Cancel this session?
          </h2>
          <label className="mt-3 block text-sm font-semibold">
            Reason (optional)
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={120}
              placeholder="e.g. Pitch closed for maintenance"
              className={`${inputClass} mt-1.5 font-normal`}
            />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirming(false)} className={buttonClass({ variant: "secondary" })}>
              Keep session
            </button>
            <button
              type="button"
              onClick={() => {
                cancelSession(session.id, reason);
                setConfirming(false);
                setStatus("Session cancelled on this device. The weekly schedule is unchanged. Players have not been notified (demo).");
              }}
              className={buttonClass({ variant: "danger" })}
            >
              Cancel session
            </button>
          </div>
        </section>
      ) : (
        <nav aria-label="Change this session" className="mt-6 flex flex-wrap justify-center gap-x-2 border-t border-line pt-3">
          {cancelled ? (
            <button
              type="button"
              onClick={() => {
                restoreSession(session.id);
                setStatus("Session restored on this device.");
              }}
              className={smallLink}
            >
              Restore this session
            </button>
          ) : (
            <>
              <Link href={`/calendar/${session.id}/edit`} className={smallLink}>
                Reschedule or move
              </Link>
              <button type="button" onClick={() => setConfirming(true)} className={`${linkBase} text-danger`}>
                Cancel session
              </button>
            </>
          )}
          {playerCanSee && (
            <Link href={`/me/calendar/${session.id}`} className={smallLink}>
              See it as a player
            </Link>
          )}
        </nav>
      )}

      <p className="mt-4 text-center text-xs text-ink-soft">Demo: fictional sessions, changes stay in this browser and nobody is notified.</p>
    </main>
  );
}
