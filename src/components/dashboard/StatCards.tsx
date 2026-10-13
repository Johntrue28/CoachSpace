"use client";

import { useMemo } from "react";
import { CalendarIcon, CheckIcon, UsersIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";
import { cardClass } from "@/components/ui/Card";
import { attendanceTotals, weekSessionStats } from "@/data/dashboard";
import { groups, peopleSummary, sessionWords } from "@/data/groups";
import { useAttendanceSetting, useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";

type Stat = { key: string; label: string; value: string; detail: string; Icon: typeof UsersIcon; tile: string };

/**
 * The three dashboard figures (D-044), from the demo data: participants, sessions this week and
 * average attendance. The attendance figure is left out while attendance is switched off (D-042).
 */
export default function StatCards({ className = "" }: { className?: string }) {
  const now = useNow();
  const { changes, ready } = useSessions();
  const { attendance } = useDemoStore();
  const attendanceSetting = useAttendanceSetting();
  const week = useMemo(() => (now && ready ? weekSessionStats(now, changes) : null), [now, ready, changes]);
  const totals = attendanceTotals(attendance);
  const people = peopleSummary();

  const stats: Stat[] = [
    {
      key: "participants",
      // People, not memberships: someone in two groups counts once (audit F-06).
      label: "Participants",
      value: String(people.people),
      detail: people.inSeveral ? `In ${groups.length} groups · ${people.inSeveral} in more than one` : `Across ${groups.length} groups`,
      Icon: UsersIcon,
      tile: "bg-sunken text-ink",
    },
    {
      key: "week",
      label: `${sessionWords().Many} this week`,
      value: week ? String(week.total) : "–",
      detail: week ? (week.remaining ? `${week.remaining} still to come` : "All done this week") : "Loading…",
      Icon: CalendarIcon,
      tile: "bg-info-soft text-info",
    },
  ];
  if (attendanceSetting.enabled) {
    stats.push({
      key: "attendance",
      label: "Average attendance",
      value: totals.rate === null ? "–" : `${totals.rate}%`,
      detail:
        totals.rate === null
          ? "None taken yet"
          : `From ${totals.sessions} session${totals.sessions === 1 ? "" : "s"} with attendance`,
      Icon: CheckIcon,
      tile: "bg-brand-soft text-brand-strong",
    });
  }

  return (
    <ul className={`grid gap-2 sm:gap-4 ${stats.length === 3 ? "grid-cols-3" : "grid-cols-2"} ${className}`}>
      {stats.map(({ key, label, value, detail, Icon, tile }) => (
        <li key={key} className={cardClass({ className: "p-3 sm:p-4" })}>
          <span className={`mb-3 hidden h-9 w-9 place-items-center rounded-control sm:mb-4 sm:grid ${tile}`}>
            <Icon className="h-5 w-5" />
          </span>
          <p className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{value}</p>
          <p className="mt-0.5 text-xs font-semibold text-ink-soft">{label}</p>
          <p className="mt-2 hidden text-xs text-ink-soft sm:block">{detail}</p>
        </li>
      ))}
    </ul>
  );
}
