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
import LiftsSection from "@/components/lifts/LiftsSection";
import { COACH_SENDER_ID } from "@/data/messages";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";
import { buttonClass } from "@/components/ui/Button";
import { LiveStatus } from "@/components/ui/StatusMessage";
import WhosComing from "@/components/rsvp/WhosComing";
import SessionHeader from "./SessionHeader";
import { t } from "@/i18n";

const linkBase = "inline-flex min-h-11 items-center px-2 text-sm font-semibold hover:underline";
const smallLink = `${linkBase} text-brand-strong`;

/**
 * A session as the coach sees it (D-076), in this order: the details, Who's coming, the plan (read-only), the
 * register, the notes, lifts, then small links to change the session or see it as a player.
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
        <BackLink fallback="/" fallbackLabel={t("back.home")} />
        <p className="mt-6 text-sm text-ink-soft">{ready ? t("session.notFound") : t("common.loading")}</p>
      </main>
    );
  }
  const cancelled = session.status === "cancelled";
  const playerCanSee = groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/" fallbackLabel={t("back.home")} />
      <LiveStatus message={status} className="mt-4" />
      <SessionHeader session={session} />

      {!cancelled && (
        <>
          <WhosComing session={session} />
          <SessionPlanCard session={session} viewer="coach" />
          <SessionAttendance session={session} />
          <SessionNotes session={session} />
          <LiftsSection session={session} viewerId={COACH_SENDER_ID} />
        </>
      )}

      {confirming ? (
        <section aria-labelledby="cancel-heading" className="mt-6 rounded-card bg-card p-4 shadow-card ring-1 ring-line">
          <h2 id="cancel-heading" className="font-bold text-ink">
            {t("session.cancelTitle")}
          </h2>
          <label className="mt-3 block text-sm font-semibold">
            {t("session.reason")}
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={120}
              placeholder={t("session.reasonPlaceholder")}
              className={`${inputClass} mt-1.5 font-normal`}
            />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirming(false)} className={buttonClass({ variant: "secondary" })}>
              {t("session.keep")}
            </button>
            <button
              type="button"
              onClick={() => {
                cancelSession(session.id, reason);
                setConfirming(false);
                setStatus(t("session.cancelled"));
              }}
              className={buttonClass({ variant: "danger" })}
            >
              {t("session.cancel")}
            </button>
          </div>
        </section>
      ) : (
        <nav aria-label={t("session.changeNav")} className="mt-6 flex flex-wrap justify-center gap-x-2 border-t border-line pt-3">
          {cancelled ? (
            <button
              type="button"
              onClick={() => {
                restoreSession(session.id);
                setStatus(t("session.restored"));
              }}
              className={smallLink}
            >
              {t("session.restore")}
            </button>
          ) : (
            <>
              <Link href={`/calendar/${session.id}/edit`} className={smallLink}>
                {t("session.reschedule")}
              </Link>
              <button type="button" onClick={() => setConfirming(true)} className={`${linkBase} text-danger`}>
                {t("session.cancel")}
              </button>
            </>
          )}
          {playerCanSee && (
            <Link href={`/me/calendar/${session.id}`} className={smallLink}>
              {t("session.asPlayer")}
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
