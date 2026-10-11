"use client";

import Link from "next/link";
import { toDateKey } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import { groupName } from "@/data/groups";
import { relativeDayLabel } from "@/components/format";
import { PinIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";
import SessionBadges from "./SessionBadges";

const action = "rounded-xl px-3 py-2 text-center text-sm font-semibold ring-1 ring-line";

/**
 * The next session that will take place, on the coach's dashboard or (with `groupIds`) a
 * participant's home. Its actions always carry the session's own group.
 */
export default function NextSessionCard({
  groupIds,
  sessionPath = "/calendar",
  groupPath = "/groups",
  coachActions = false,
}: {
  groupIds?: string[];
  sessionPath?: string;
  groupPath?: string;
  coachActions?: boolean;
}) {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  const next = now && ready ? upcoming(now, { limit: 1, groupIds, activeOnly: true })[0] : undefined;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">Next session</p>
      {!now || !ready ? (
        <p className="mt-1 text-sm text-ink-soft">Loading…</p>
      ) : !next ? (
        <p className="mt-1 text-sm text-ink-soft">No upcoming sessions.</p>
      ) : (
        <>
          <Link href={`${sessionPath}/${next.id}`} className="mt-1 block hover:underline">
            <span className="text-lg font-bold">{next.title}</span>
          </Link>
          <p className="text-sm text-ink-soft">
            {groupName(next.groupId)} · {relativeDayLabel(next.date, toDateKey(now))}, {next.time}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
            <PinIcon className="h-4 w-4" /> {next.place}
          </p>
          <div className="mt-2">
            <SessionBadges session={next} />
          </div>
          <div className={`mt-3 grid gap-2 ${coachActions ? "grid-cols-2" : "grid-cols-1"}`}>
            {coachActions && (
              <Link
                href={`/calendar/${next.id}/attendance?group=${next.groupId}`}
                className={`${action} bg-brand text-white ring-brand`}
              >
                Take attendance
              </Link>
            )}
            <Link href={`${groupPath}/${next.groupId}`} className={`${action} text-brand`}>
              Open {groupName(next.groupId)}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
