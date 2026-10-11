"use client";

import Link from "next/link";
import { toDateKey, upcomingSessions } from "@/data/calendar";
import { groupName } from "@/data/groups";
import { relativeDayLabel } from "@/components/format";
import { PinIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";

/** The coach's next session, on the dashboard. */
export default function NextSessionCard() {
  const now = useNow();
  const next = now ? upcomingSessions(now, { limit: 1 })[0] : undefined;

  return (
    <Link
      href={next ? `/calendar/${next.id}` : "/calendar"}
      className="block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line hover:ring-brand"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">Next session</p>
      {!now ? (
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
        </>
      )}
    </Link>
  );
}
