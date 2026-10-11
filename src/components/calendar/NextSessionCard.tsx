"use client";

import Link from "next/link";
import { toDateKey } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import SessionBadges from "./SessionBadges";
import { groupName } from "@/data/groups";
import { relativeDayLabel } from "@/components/format";
import { PinIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";

/** The next session, on the coach's dashboard or (with `groupIds`) a participant's home. */
export default function NextSessionCard({
  groupIds,
  sessionPath = "/calendar",
}: {
  groupIds?: string[];
  sessionPath?: string;
}) {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  // The next session that will actually take place.
  const next = now && ready ? upcoming(now, { limit: 1, groupIds, activeOnly: true })[0] : undefined;

  return (
    <Link
      href={next ? `${sessionPath}/${next.id}` : sessionPath}
      className="block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line hover:ring-brand"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">Next session</p>
      {!now || !ready ? (
        <p className="mt-1 text-sm text-ink-soft">Loading…</p>
      ) : !next ? (
        <p className="mt-1 text-sm text-ink-soft">No upcoming sessions.</p>
      ) : (
        <>
          <p className="mt-1 text-lg font-bold">{next.title}</p>
          <p className="text-sm text-ink-soft">
            {groupName(next.groupId)} · {relativeDayLabel(next.date, toDateKey(now))}, {next.time}
          </p>
          <p className="mt-2 flex items-center gap-1 text-sm text-ink-soft">
            <PinIcon className="h-4 w-4" /> {next.place}
          </p>
          <div className="mt-2">
            <SessionBadges session={next} />
          </div>
        </>
      )}
    </Link>
  );
}
