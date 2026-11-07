"use client";

import Link from "next/link";
import { useSessions } from "@/data/use-sessions";
import { DEMO_PARTICIPANT_ID, groupById, groupIdsOf } from "@/data/groups";
import { sessionStart } from "@/data/calendar";
import BackLink from "@/components/navigation/BackLink";
import SessionHeader from "@/components/calendar/SessionHeader";
import SessionPlanCard from "@/components/plans/SessionPlanCard";
import RsvpButtons from "@/components/rsvp/RsvpButtons";
import { cardClass } from "@/components/ui/Card";
import LiftsSection from "@/components/lifts/LiftsSection";
import { t } from "@/i18n";

/** A session as the player sees it (D-076): details, "Are you coming?", the coach's plan read-only and lifts. No coach controls or notes. */
export default function ParticipantSessionDetail({ id }: { id: string }) {
  const { ready, byId } = useSessions();
  // Wait for the saved calendar changes (one-off sessions, and dates formatted in the browser).
  const session = ready ? byId(id) : undefined;
  const group = session && groupById(session.groupId);
  // A participant only sees sessions of their own groups.
  if (!session || !group || !groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <BackLink fallback="/me" fallbackLabel={t("back.home")} />
        <p className="mt-6 text-sm text-ink-soft">{ready ? t("session.notAvailable") : t("common.loading")}</p>
      </main>
    );
  }
  const cancelled = session.status === "cancelled";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/me" fallbackLabel={t("back.home")} />
      <SessionHeader session={session} />

      {!cancelled && sessionStart(session) > new Date() && (
        <section aria-labelledby="are-you-coming" className={cardClass({ className: "mt-4" })}>
          <h2 id="are-you-coming" className="mb-3 text-lg font-bold text-ink">
            {t("rsvp.question")}
          </h2>
          <RsvpButtons session={session} participantId={DEMO_PARTICIPANT_ID} />
        </section>
      )}

      {!cancelled && <SessionPlanCard session={session} viewer="player" />}
      {!cancelled && <LiftsSection session={session} viewerId={DEMO_PARTICIPANT_ID} />}

      <p className="mt-6 text-center">
        <Link href={`/calendar/${session.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong hover:underline">
          {t("player.backToCoach")}
        </Link>
      </p>
    </main>
  );
}
