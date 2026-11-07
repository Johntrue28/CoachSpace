"use client";

import Link from "next/link";
import { useState } from "react";
import { attendanceLog, groupAttendanceRate, sessionsWithoutAttendance } from "@/data/attendance";
import { colourOf, groupById, groups } from "@/data/groups";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { ChevronRightIcon } from "@/components/Icons";
import { formatLogDay } from "@/components/format";
import { useNow } from "@/components/useNow";
import { ChipRow, FilterChip } from "@/components/ui/FilterChip";
import { listClass } from "@/components/ui/Card";
import { Loading } from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import AttendanceLog from "./AttendanceLog";
import { t } from "@/i18n";

/** How far back "Registers to take" looks. */
const DAYS_BACK = 14;

/**
 * The Attendance page (D-076), reached from Profile: the registers still to take at the top, then the attendance
 * log by date for each group — the same rows as a group's Attendance tab — with group chips to filter. `groupId`
 * (`?group=`) starts the log on one group. Attendance is always on.
 */
export default function AttendanceStart({ groupId }: { groupId?: string }) {
  const now = useNow();
  const sessions = useSessions();
  const { attendance, ready } = useDemoStore();
  const [shown, setShown] = useState<string | null>(groupId && groupById(groupId) ? groupId : null);

  const loading = !now || !sessions.ready || !ready;
  const toTake = loading
    ? []
    : sessionsWithoutAttendance(now, sessions.changes, attendance, { daysBack: DAYS_BACK })
        .flatMap((g) => g.sessionIds)
        .map((id) => sessions.byId(id))
        .filter((s) => s !== undefined)
        .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  const logGroups = groups.filter((g) => !shown || g.id === shown);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 lg:pt-8">
      <PageHeader title={t("attendance.title")} description={t("attendance.description")} />

      {loading ? (
        <Loading block />
      ) : (
        <>
          <section aria-labelledby="to-take" className="mt-6">
            <h2 id="to-take" className="px-1 text-base font-bold text-ink">
              {t("attendance.toTake")}
            </h2>
            {toTake.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">{t("attendance.allTaken")}</p>
            ) : (
              <ul className={listClass("mt-2")} aria-label={t("attendance.toTake")}>
                {toTake.map((s) => (
                  <li key={s.id}>
                    <Link href={`/calendar/${s.id}/attendance?group=${s.groupId}`} className="press flex min-h-14 items-center gap-3 px-4 py-3 transition hover:bg-surface">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colourOf(s.groupId).solid }} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {formatLogDay(s.date)} · {s.time} · {groupById(s.groupId)?.name}
                        </span>
                        <span className="block truncate text-xs text-ink-soft">{s.title}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-brand-strong">{t("attendance.take")}</span>
                      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="attendance-log" className="mt-8">
            <h2 id="attendance-log" className="px-1 text-base font-bold text-ink">
              {t("attendance.log")}
            </h2>
            <ChipRow label={t("home.showGroups")} className="mt-2">
              <FilterChip active={shown === null} onClick={() => setShown(null)}>
                {t("common.allGroups")}
              </FilterChip>
              {groups.map((g) => (
                <FilterChip key={g.id} active={shown === g.id} onClick={() => setShown(shown === g.id ? null : g.id)}>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colourOf(g.id).solid }} aria-hidden="true" />
                  {g.name}
                </FilterChip>
              ))}
            </ChipRow>
            <div className="mt-4 space-y-6">
              {logGroups.map((g) => {
                const rate = groupAttendanceRate(attendance, g.id);
                return (
                  <section key={g.id} aria-labelledby={`log-${g.id}`}>
                    <h3 id={`log-${g.id}`} className="flex items-baseline justify-between gap-3 px-1">
                      <span className="truncate text-sm font-bold text-ink">{g.name}</span>
                      {rate !== null && <span className="shrink-0 text-sm font-bold tabular-nums text-ink">{rate}%</span>}
                    </h3>
                    <AttendanceLog rows={attendanceLog(attendance, [g.id], (id) => sessions.byId(id)?.date)} showGroup label={t("attendance.registersOf", { group: g.name })} />
                  </section>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
