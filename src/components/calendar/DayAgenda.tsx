import Link from "next/link";
import { sessionState } from "@/data/calendar";
import { groupName } from "@/data/groups";
import type { Session } from "@/data/types";
import { formatDateKey, formatDateKeyFull } from "@/components/format";
import { ChevronRightIcon, PinIcon } from "@/components/Icons";
import { cardClass } from "@/components/ui/Card";
import SessionBadges from "./SessionBadges";
import { stateAccent, stateText } from "./sessionStyles";
import { t } from "@/i18n";

/**
 * The selected day's sessions under the month grid (Figma "selected session" panel): time, title, group, place
 * and changes; each opens the session (where it is changed). New session is the page's own button.
 */
export default function DayAgenda({
  date,
  today,
  sessions,
  noGroups = false,
}: {
  date: string;
  today: string;
  sessions: Session[];
  /** Every group is hidden by the calendar filter. */
  noGroups?: boolean;
}) {
  return (
    <section aria-labelledby="day-heading" className={cardClass({ className: "sm:p-5" })}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="day-heading" className="flex items-center gap-2 text-base font-bold text-ink">
          {formatDateKeyFull(date).replace(/ \d{4}$/, "")}
          {date === today && <span className="rounded-full bg-brand-strong px-2 py-0.5 text-label font-bold text-on-brand">{t("common.today")}</span>}
        </h2>
      </div>
      {sessions.length === 0 ? (
        <p className="mt-3 rounded-control border border-dashed border-line-strong px-4 py-3 text-sm text-ink-soft">{noGroups ? t("calendar.noGroupsSelected") : t("calendar.noSessionsDay")}</p>
      ) : (
        <ul className="mt-3 space-y-2" aria-label={t("calendar.sessionsOn", { day: formatDateKey(date) })}>
          {sessions.map((s) => {
            const state = sessionState(s);
            const cancelled = state === "cancelled";
            return (
              <li
                key={s.id}
                className={`flex flex-col gap-2 rounded-control border border-l-4 border-line bg-card p-3 sm:flex-row sm:items-center sm:gap-3 ${stateAccent[state]}`}
              >
                <Link href={`/calendar/${s.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <span className="w-12 shrink-0">
                    <span className={`block text-sm font-bold ${stateText[state]}`}>{s.time}</span>
                    <span className="block text-xs text-ink-soft">{s.endTime}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-bold ${cancelled ? "text-ink-soft line-through" : "text-ink"}`}>{s.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
                      <span>{groupName(s.groupId)}</span>
                      <span className="flex items-center gap-1">
                        <PinIcon className="h-3.5 w-3.5" />
                        {s.place}
                      </span>
                    </span>
                    <span className="mt-1.5 block empty:hidden">
                      <SessionBadges session={s} />
                    </span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
