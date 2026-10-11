"use client";

import Link from "next/link";
import { toDateKey } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import SessionBadges from "./SessionBadges";
import { groupName } from "@/data/groups";
import { relativeDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";

/** Next sessions from now, for the dashboard, one group's page or a participant's groups. */
export default function SessionList({
  groupId,
  groupIds,
  limit = 4,
  sessionPath = "/calendar",
}: {
  groupId?: string;
  groupIds?: string[];
  limit?: number;
  sessionPath?: string;
}) {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  if (!now || !ready) return <p className="text-sm text-ink-soft">Loading sessions…</p>;

  // Cancelled sessions stay in the list, clearly marked, so nobody misses the change.
  const sessions = upcoming(now, { limit, groupId, groupIds });
  if (sessions.length === 0) return <p className="text-sm text-ink-soft">No upcoming sessions.</p>;

  const today = toDateKey(now);
  return (
    <ul className="space-y-1">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link href={`${sessionPath}/${s.id}`} className="-mx-2 flex gap-3 rounded-xl px-2 py-1.5 hover:bg-surface">
            <div className="w-20 shrink-0 text-sm">
              <p className="font-semibold">{relativeDayLabel(s.date, today)}</p>
              <p className="text-ink-soft">{s.time}</p>
            </div>
            <div className={`min-w-0 border-l-2 pl-3 ${s.status === "cancelled" ? "border-red-700" : "border-brand"}`}>
              <p className={`font-semibold ${s.status === "cancelled" ? "text-ink-soft line-through" : ""}`}>{s.title}</p>
              <p className="truncate text-sm text-ink-soft">{groupId ? s.place : groupName(s.groupId)}</p>
              <SessionBadges session={s} compact />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
