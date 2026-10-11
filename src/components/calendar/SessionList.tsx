"use client";

import Link from "next/link";
import { toDateKey, upcomingSessions } from "@/data/calendar";
import { groupName } from "@/data/groups";
import { relativeDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";

/** Next sessions from now, for the dashboard or one group's page. */
export default function SessionList({ groupId, limit = 4 }: { groupId?: string; limit?: number }) {
  const now = useNow();
  if (!now) return <p className="text-sm text-ink-soft">Loading sessions…</p>;

  const sessions = upcomingSessions(now, { limit, groupId });
  if (sessions.length === 0) return <p className="text-sm text-ink-soft">No upcoming sessions.</p>;

  const today = toDateKey(now);
  return (
    <ul className="space-y-1">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link href={`/calendar/${s.id}`} className="-mx-2 flex gap-3 rounded-xl px-2 py-1.5 hover:bg-surface">
            <div className="w-20 shrink-0 text-sm">
              <p className="font-semibold">{relativeDayLabel(s.date, today)}</p>
              <p className="text-ink-soft">{s.time}</p>
            </div>
            <div className="min-w-0 border-l-2 border-brand pl-3">
              <p className="font-semibold">{s.title}</p>
              <p className="truncate text-sm text-ink-soft">{groupId ? s.place : groupName(s.groupId)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
