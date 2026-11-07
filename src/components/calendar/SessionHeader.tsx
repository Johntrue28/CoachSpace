import type { Session } from "@/data/types";
import { colourOf, groupName } from "@/data/groups";
import { formatDateKeyFull } from "@/components/format";
import { CalendarIcon, PinIcon } from "@/components/Icons";
import SessionBadges from "./SessionBadges";

/**
 * The top of a session page, the same for the coach and the player (D-076): the title, its changes, then one
 * compact block with the date and time, the place and the group (name and colour dot, plain text).
 */
export default function SessionHeader({ session }: { session: Session }) {
  const cancelled = session.status === "cancelled";
  return (
    <>
      <h1 className={`mt-4 text-2xl font-bold tracking-tight ${cancelled ? "text-ink-soft line-through" : "text-ink"}`}>{session.title}</h1>
      <div className="mt-2 empty:hidden">
        <SessionBadges session={session} />
      </div>
      {cancelled && (
        <p className="mt-2 text-sm text-danger">
          This session will not take place{session.cancelReason ? `: ${session.cancelReason}` : "."}
        </p>
      )}
      <div className="mt-3 space-y-1.5 text-sm text-ink">
        <p className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 shrink-0 text-ink-soft" />
          <span>
            {formatDateKeyFull(session.date)} · <span className="font-semibold tabular-nums">{session.time}–{session.endTime}</span>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <PinIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {session.place}
        </p>
        <p className="flex items-center gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colourOf(session.groupId).solid }} />
          </span>
          {groupName(session.groupId)}
        </p>
      </div>
    </>
  );
}
