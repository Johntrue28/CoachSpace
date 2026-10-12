"use client";

import Link from "next/link";
import { attendanceCandidates } from "@/data/attendance";
import { attendanceSummary } from "@/data/calendar";
import { sessionsWithoutAttendance } from "@/data/activity";
import { groupById, groups, memberCount, groupName } from "@/data/groups";
import { useAttendanceSetting, useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import type { AttendanceRecord, ScheduleChanges, Session } from "@/data/types";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon } from "@/components/Icons";
import { formatDateKey } from "@/components/format";
import { useNow } from "@/components/useNow";
import Badge from "@/components/ui/Badge";
import { Loading } from "@/components/ui/EmptyState";
import { cardClass } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import AttendanceOff from "./AttendanceOff";
import AttendanceSwitch from "./AttendanceSwitch";

/**
 * The Attendance page (Figma Attendance, D-051): the global switch (D-042), then the group, then
 * one of its sessions (today first, then the last two weeks), and the attendance already saved.
 */
export default function AttendanceStart({ groupId }: { groupId?: string }) {
  const now = useNow();
  const { ready, changes, byId } = useSessions();
  const { attendance } = useDemoStore();
  const setting = useAttendanceSetting();
  const group = groupId ? groupById(groupId) : undefined;

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title={setting.enabled || !setting.ready ? "Take attendance" : "Attendance"}
        description="Record who came to each session. Saved in this browser only."
      />
      <AttendanceSwitch className={cardClass({ className: "mt-5 sm:p-5" })} />

      {!setting.ready ? (
        <Loading block />
      ) : !setting.enabled ? (
        <AttendanceOff />
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0">
            {!group ? (
              <GroupChooser now={ready ? now : null} changes={changes} attendance={attendance} />
            ) : (
              <>
                <ChosenGroup id={group.id} name={group.name} />
                {!now || !ready ? (
                  <Loading block />
                ) : (
                  <Candidates group={group.id} now={now} changes={changes} attendance={attendance} />
                )}
              </>
            )}
          </div>
          {ready ? <SavedAttendance attendance={attendance} groupId={group?.id} byId={byId} /> : <Loading />}
        </div>
      )}
    </main>
  );
}

function GroupChooser({ now, changes, attendance }: { now: Date | null; changes: ScheduleChanges; attendance: AttendanceRecord[] }) {
  // The reminders need today's date, known only in the browser; the groups show at once.
  const missing = new Map(now ? sessionsWithoutAttendance(now, changes, attendance).map((m) => [m.groupId, m.sessionIds.length]) : []);
  return (
    <section aria-labelledby="choose-group">
      <h2 id="choose-group" className="mb-3 text-base font-bold text-ink">
        Which group?
      </h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {groups.map((g) => {
          const open = missing.get(g.id) ?? 0;
          return (
            <li key={g.id}>
              <Link href={`/attendance?group=${g.id}`} className={cardClass({ interactive: true, className: "group flex h-full items-center gap-3" })}>
                <Avatar name={g.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-ink">{g.name}</span>
                  <span className="block text-sm text-ink-soft">{memberCount(g.id)} participants</span>
                  {open > 0 && (
                    <span className="mt-1 block text-xs font-semibold text-attention-ink">
                      {open} recent session{open === 1 ? "" : "s"} without attendance
                    </span>
                  )}
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ChosenGroup({ id, name }: { id: string; name: string }) {
  return (
    <div className={cardClass({ className: "flex items-center gap-3 sm:p-5" })}>
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold text-ink">{name}</h2>
        <p className="text-sm text-ink-soft">{memberCount(id)} participants</p>
      </div>
      <Link href="/attendance" className="shrink-0 text-sm font-semibold text-brand-strong hover:underline">
        Change group
      </Link>
    </div>
  );
}

function Candidates({
  group,
  now,
  changes,
  attendance,
}: {
  group: string;
  now: Date;
  changes: Parameters<typeof attendanceCandidates>[2];
  attendance: AttendanceRecord[];
}) {
  const { today, recent } = attendanceCandidates(group, now, changes);
  const records = new Map(attendance.map((r) => [r.sessionId, r]));
  return (
    <>
      <List title="Today" sessions={today} group={group} records={records} empty="No session today." />
      <List title="Recent sessions" sessions={recent.slice(0, 6)} group={group} records={records} empty="No sessions in the last two weeks." />
      <p className="mt-4 text-sm text-ink-soft">
        Looking for another date?{" "}
        <Link href={`/calendar?group=${group}`} className="font-semibold text-brand-strong">
          Open the calendar
        </Link>
      </p>
    </>
  );
}

function List({
  title,
  sessions,
  group,
  records,
  empty,
}: {
  title: string;
  sessions: Session[];
  group: string;
  records: Map<string, AttendanceRecord>;
  empty: string;
}) {
  return (
    <section className="mt-5" aria-label={title}>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</h2>
      {sessions.length === 0 ? (
        <p className="rounded-card border border-dashed border-line-strong px-4 py-3 text-sm text-ink-soft">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line">
          {sessions.map((s) => {
            const record = records.get(s.id);
            const summary = record && attendanceSummary(record);
            return (
              <li key={s.id}>
                <Link href={`/calendar/${s.id}/attendance?group=${group}`} className="flex items-center gap-3 p-4 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{s.title}</p>
                    <p className="text-sm text-ink-soft">
                      {formatDateKey(s.date)}, {s.time}
                    </p>
                  </div>
                  {summary ? (
                    <Badge tone="brand">
                      Taken · {summary.present}/{summary.total}
                    </Badge>
                  ) : (
                    <Badge tone="attention">Not taken</Badge>
                  )}
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** The attendance saved in this browser, newest session first; each opens the record to correct it. */
function SavedAttendance({
  attendance,
  groupId,
  byId,
}: {
  attendance: AttendanceRecord[];
  groupId?: string;
  byId: (id: string) => Session | undefined;
}) {
  const rows = attendance
    .filter((r) => !groupId || r.groupId === groupId)
    .map((record) => ({ record, session: byId(record.sessionId) }))
    .filter((x): x is { record: AttendanceRecord; session: Session } => Boolean(x.session))
    .sort((a, b) => b.session.date.localeCompare(a.session.date) || b.session.time.localeCompare(a.session.time));
  return (
    <section aria-labelledby="saved-attendance" className={cardClass({ className: "h-fit sm:p-5" })}>
      <h2 id="saved-attendance" className="text-base font-bold text-ink">
        Saved attendance{groupId ? ` · ${groupName(groupId)}` : ""}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">No attendance saved yet. Choose a session to start.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {rows.map(({ record, session }) => {
            const { present, total } = attendanceSummary(record);
            return (
              <li key={record.sessionId}>
                <Link href={`/calendar/${session.id}/attendance?group=${record.groupId}`} className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-surface">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{session.title}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      {groupName(record.groupId)} · {formatDateKey(session.date)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm">
                    <span className="font-bold text-brand-strong">{present}</span>
                    <span className="text-ink-soft">/{total} present</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
