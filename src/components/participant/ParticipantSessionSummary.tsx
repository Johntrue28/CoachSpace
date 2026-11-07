import type { Session } from "@/data/types";
import { coach } from "@/data/groups";
import { formatDateKeyFull } from "@/components/format";
import { CalendarIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/Icons";
import SessionBadges from "@/components/calendar/SessionBadges";

/**
 * What a participant sees of a session: its title, its changes (cancelled, moved, new place,
 * extra) and when and where it takes place. Used on the participant's session page and, unchanged,
 * in the coach's demo preview of a change (audit R-04), so the preview is exactly what they would see.
 */
export default function ParticipantSessionSummary({ session, preview = false }: { session: Session; preview?: boolean }) {
  const cancelled = session.status === "cancelled";
  const Title = preview ? "h3" : "h1";
  return (
    <>
      <p className={`${preview ? "" : "mt-4 "}text-xs font-semibold uppercase tracking-wide text-brand-strong`}>
        {session.kind === "one-off" ? "Extra session" : "Training session"}
      </p>
      <Title className={`mt-1 font-bold ${preview ? "text-lg" : "text-2xl"} ${cancelled ? "text-ink-soft line-through" : ""}`}>
        {session.title}
      </Title>
      <div className="mt-2">
        <SessionBadges session={session} />
      </div>
      {cancelled && (
        <p className="mt-2 text-sm text-danger">
          This session will not take place{session.cancelReason ? `: ${session.cancelReason}` : "."}
        </p>
      )}

      <div className={`mt-4 space-y-3 rounded-2xl p-4 text-sm ring-1 ring-line ${preview ? "bg-surface" : "bg-card"}`}>
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
      </div>
    </>
  );
}
