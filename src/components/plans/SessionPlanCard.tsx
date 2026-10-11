"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { minutesBetween } from "@/data/calendar";
import { itemsByBlock, planForSession, plansForGroup, templatesOf, totalMinutes } from "@/data/plans";
import type { Session } from "@/data/types";
import { inputClass } from "@/components/Form";
import { buttonClass } from "@/components/ui/Button";

/** The plan of one session: open it, or create it empty, from a template or from an earlier plan. */
export default function SessionPlanCard({ session }: { session: Session }) {
  const router = useRouter();
  const { plans, ready, createPlan, copyPlan } = useDemoStore();
  const [source, setSource] = useState("empty");
  const plan = planForSession(plans, session.id);
  const length = minutesBetween(session.time, session.endTime);

  if (!ready) return null;

  if (plan) {
    return (
      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line" aria-labelledby="session-plan">
        <div className="flex items-center justify-between gap-3">
          <h2 id="session-plan" className="font-bold">
            Session plan
          </h2>
          <Link href={`/library/plans/${plan.id}`} className="text-sm font-semibold text-brand-strong">
            Open plan
          </Link>
        </div>
        <p className="mt-1 text-sm font-semibold">{plan.title}</p>
        <p className="text-xs text-ink-soft">
          {totalMinutes(plan)} of {length} min planned · {plan.items.length} exercise{plan.items.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1">
          {itemsByBlock(plan)
            .filter((b) => b.items.length > 0)
            .map((b) => (
              <li key={b.id} className="rounded-full bg-surface px-2 py-0.5 text-label font-medium ring-1 ring-line">
                {b.label} · {b.items.length}
              </li>
            ))}
        </ul>
      </section>
    );
  }

  const templates = templatesOf(plans);
  const earlier = plansForGroup(plans, session.groupId).filter((p) => p.sessionId !== session.id);

  function create() {
    const target = { kind: "plan" as const, title: session.title, groupId: session.groupId, sessionId: session.id };
    const created = source === "empty" ? createPlan(target) : copyPlan(source, target);
    if (created) router.push(`/library/plans/${created.id}?from=session`);
  }

  return (
    <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line" aria-labelledby="session-plan">
      <h2 id="session-plan" className="font-bold">
        Session plan
      </h2>
      <p className="mt-1 text-sm text-ink-soft">No plan yet. Start from scratch, a template or an earlier plan of this group.</p>
      <label className="mt-3 block text-sm font-semibold">
        Start from
        <select value={source} onChange={(e) => setSource(e.target.value)} className={`${inputClass} mt-1.5 font-normal`}>
          <option value="empty">Empty plan</option>
          {templates.length > 0 && (
            <optgroup label="Templates">
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </optgroup>
          )}
          {earlier.length > 0 && (
            <optgroup label="Earlier plans of this group">
              {earlier.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      <button type="button" onClick={create} className={buttonClass({ block: true, className: "mt-3" })}>
        Plan this session
      </button>
      {source !== "empty" && <p className="mt-2 text-center text-xs text-ink-soft">A copy is made; the original stays as it is.</p>}
    </section>
  );
}
