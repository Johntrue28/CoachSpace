"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { attendanceSummary } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import { groupName } from "@/data/groups";
import { formatDateKey } from "@/components/format";

/** Simple attendance summary for the dashboard: the latest sessions with attendance taken. */
export default function RecentAttendance({ limit = 3 }: { limit?: number }) {
  const { attendance, ready } = useDemoStore();
  const { byId } = useSessions();
  if (!ready) return <p className="text-sm text-ink-soft">Loading…</p>;

  const rows = attendance
    .map((r) => ({ record: r, session: byId(r.sessionId) }))
    .filter((x) => x.session)
    .sort((a, b) => b.session!.date.localeCompare(a.session!.date) || b.session!.time.localeCompare(a.session!.time))
    .slice(0, limit);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        No attendance taken yet. Open a session in the{" "}
        <Link href="/calendar" className="font-semibold text-brand">
          calendar
        </Link>{" "}
        to take it.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {rows.map(({ record, session }) => {
        const { present, total } = attendanceSummary(record);
        return (
          <li key={record.sessionId}>
            <Link href={`/calendar/${session!.id}`} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{groupName(record.groupId)}</p>
                <p className="truncate text-xs text-ink-soft">
                  {session!.title} · {formatDateKey(session!.date)}
                </p>
              </div>
              <p className="shrink-0 text-sm">
                <span className="font-bold text-brand">{present}</span>
                <span className="text-ink-soft">/{total} present</span>
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
