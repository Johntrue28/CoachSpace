"use client";

import { useState } from "react";
import type { Group } from "@/data/types";
import { participantsOf } from "@/data/groups";
import { attendanceLog, groupAttendanceRate, mostMissed } from "@/data/attendance";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import AttendanceLog from "@/components/attendance/AttendanceLog";
import { cardClass } from "@/components/ui/Card";
import { Loading } from "@/components/ui/EmptyState";
import { t, tn } from "@/i18n";

/** How many registers the tab shows before "Show all". */
const SHOWN = 6;

/**
 * A group's attendance at a glance (D-076): the season average in large type, the last registers by date and
 * the players who missed most. A register row opens the saved register.
 */
export default function GroupAttendance({ group }: { group: Group }) {
  const { attendance, ready } = useDemoStore();
  const sessions = useSessions();
  const [all, setAll] = useState(false);
  if (!ready || !sessions.ready) return <Loading />;
  const rows = attendanceLog(attendance, [group.id], (id) => sessions.byId(id)?.date);
  const rate = groupAttendanceRate(attendance, group.id);
  const missed = mostMissed(attendance, group.id, participantsOf(group.id));

  return (
    <div className="space-y-4">
      <section aria-labelledby="season-average" className={cardClass()}>
        <h2 id="season-average" className="text-sm font-semibold text-ink-soft">
          {t("groups.seasonAverage")}
        </h2>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums text-ink">{rate === null ? "–" : `${rate}%`}</span>
          <span className="text-sm text-ink-soft">
            {tn("groups.registers", rows.length)}
          </span>
        </p>
      </section>

      <section aria-labelledby="last-sessions">
        <h2 id="last-sessions" className="px-1 text-base font-bold text-ink">
          {t("groups.lastSessions")}
        </h2>
        <AttendanceLog rows={all ? rows : rows.slice(0, SHOWN)} showGroup={false} label={t("groups.registersList")} />
        {!all && rows.length > SHOWN && (
          <button type="button" onClick={() => setAll(true)} className="mt-1 inline-flex min-h-11 items-center px-1 text-sm font-semibold text-brand-strong hover:underline">
            {t("common.showAll", { count: rows.length })}
          </button>
        )}
      </section>

      {missed.length > 0 && (
        <section aria-labelledby="missed-most">
          <h2 id="missed-most" className="px-1 text-base font-bold text-ink">
            {t("groups.missedMost")}
          </h2>
          <ul className={cardClass({ padded: false, className: "mt-2 divide-y divide-line" })}>
            {missed.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate font-semibold text-ink">{p.name}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">
                  <span className="font-bold text-ink">{p.rate}%</span> · {t("groups.missed", { count: p.missed })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
