"use client";

import { useState } from "react";
import type { SessionPlan } from "@/data/types";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { planForSession } from "@/data/plans";
import { colourOf, groupName } from "@/data/groups";
import { formatDateKey } from "@/components/format";
import { useNow } from "@/components/useNow";
import { buttonClass } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { Loading } from "@/components/ui/EmptyState";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { t } from "@/i18n";

/** How many upcoming sessions "Use in session" offers. */
const OFFERED = 12;

/**
 * "Use in session" (D-076): the plan's group's upcoming sessions (every group's for a plan for any group), ticked
 * where the plan is used. A session has one plan at most, so choosing it replaces the plan it had.
 */
export default function UseInSessions({ plan }: { plan: SessionPlan }) {
  const { plans, setPlanSessions, ready } = useDemoStore();
  const sessions = useSessions();
  const now = useNow();
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [status, setStatus] = useState("");
  if (!ready || !sessions.ready || !now) return <Loading className="mt-6" />;

  const offered = sessions.upcoming(now, { limit: OFFERED, activeOnly: true, groupId: plan.groupId ?? undefined });
  const picked = chosen ?? plan.sessionIds;
  const changed = chosen !== null && [...chosen].sort().join() !== [...plan.sessionIds].sort().join();

  return (
    <section aria-labelledby="use-in-session" className={cardClass({ className: "mt-6" })}>
      <h2 id="use-in-session" className="text-lg font-bold text-ink">
        {t("useIn.title")}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{t("useIn.hint")}</p>
      {offered.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">{t("useIn.none")}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {offered.map((s) => {
            const other = planForSession(plans, s.id);
            const replaces = other && other.id !== plan.id ? other.title : null;
            return (
              <li key={s.id}>
                <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={picked.includes(s.id)}
                    onChange={(e) => {
                      setStatus("");
                      setChosen(e.target.checked ? [...picked, s.id] : picked.filter((id) => id !== s.id));
                    }}
                    className="h-5 w-5 shrink-0 accent-brand-strong"
                  />
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colourOf(s.groupId).solid }} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">
                      {formatDateKey(s.date)}, {s.time} · {s.title}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {groupName(s.groupId)}
                      {replaces && t("useIn.now", { title: replaces })}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        disabled={!changed}
        onClick={() => {
          const shown = offered.map((s) => s.id);
          // Sessions the list does not show (past or further away) keep this plan.
          setPlanSessions(plan.id, [...plan.sessionIds.filter((id) => !shown.includes(id)), ...picked.filter((id) => shown.includes(id))]);
          setChosen(null);
          setStatus(t("useIn.saved"));
        }}
        className={buttonClass({ variant: "secondary", block: true, className: "mt-3" })}
      >
        {t("useIn.save")}
      </button>
      <LiveStatus message={status} className="mt-2" />
    </section>
  );
}
