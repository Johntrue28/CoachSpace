"use client";

import Link from "next/link";
import { attendanceCandidates } from "@/data/attendance";
import { groupById, groups, memberCount } from "@/data/groups";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import type { Session } from "@/data/types";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon } from "@/components/Icons";
import BackLink from "@/components/navigation/BackLink";
import { formatDateKey } from "@/components/format";
import { useNow } from "@/components/useNow";
import { Loading } from "@/components/ui/EmptyState";

/** "Take attendance" without a session: choose the group first, then one of its sessions. */
export default function AttendanceStart({ groupId }: { groupId?: string }) {
  const now = useNow();
  const { ready, changes } = useSessions();
  const { attendance } = useDemoStore();
  const group = groupId ? groupById(groupId) : undefined;

  return (
    <main className="px-4 pt-6">
      <BackLink fallback="/" fallbackLabel="Home" />
      <h1 className="mt-4 text-2xl font-bold">Take attendance</h1>

      {!group ? (
        <>
          <p className="mt-1 text-sm text-ink-soft">Which group?</p>
          <ul className="mt-4 space-y-2">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/attendance?group=${g.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line hover:ring-brand"
                >
                  <Avatar name={g.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-sm text-ink-soft">{memberCount(g.id)} participants</p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : !now || !ready ? (
        <Loading block />
      ) : (
        <Candidates group={group.id} name={group.name} now={now} changes={changes} taken={new Set(attendance.map((a) => a.sessionId))} />
      )}
    </main>
  );
}

function Candidates({
  group,
  name,
  now,
  changes,
  taken,
}: {
  group: string;
  name: string;
  now: Date;
  changes: Parameters<typeof attendanceCandidates>[2];
  taken: Set<string>;
}) {
  const { today, recent } = attendanceCandidates(group, now, changes);
  return (
    <>
      <p className="mt-1 text-sm text-ink-soft">
        {name} ·{" "}
        <Link href="/attendance" className="font-semibold text-brand-strong">
          Change group
        </Link>
      </p>
      <List title="Today" sessions={today} group={group} taken={taken} empty="No session today." />
      <List title="Recent sessions" sessions={recent.slice(0, 6)} group={group} taken={taken} empty="No sessions in the last two weeks." />
      <p className="mt-4 text-sm text-ink-soft">
        Looking for another date?{" "}
        <Link href={`/calendar?group=${group}`} className="font-semibold text-brand-strong">
          Open the calendar
        </Link>
      </p>
    </>
  );
}

function List({ title, sessions, group, taken, empty }: { title: string; sessions: Session[]; group: string; taken: Set<string>; empty: string }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{title}</h2>
      {sessions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-ink-soft">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card ring-1 ring-line">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link href={`/calendar/${s.id}/attendance?group=${group}`} className="flex items-center gap-3 p-4 hover:bg-surface">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.title}</p>
                  <p className="text-sm text-ink-soft">
                    {formatDateKey(s.date)}, {s.time}
                  </p>
                </div>
                {taken.has(s.id) && <span className="text-xs font-semibold text-brand-strong">Taken</span>}
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
