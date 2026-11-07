"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { itemsByBlock, planForSession, totalMinutes } from "@/data/plans";
import type { Session } from "@/data/types";
import { buttonClass } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";

/**
 * The plan of one session, read-only (D-076): its name, the total minutes in large type, the exercises per
 * block and "Open plan". Plans are made and changed in Library; without one the coach gets one line and a
 * link to Library, the player sees nothing.
 */
export default function SessionPlanCard({ session, viewer }: { session: Session; viewer: "coach" | "player" }) {
  const { plans, ready } = useDemoStore();
  if (!ready) return null;
  const plan = planForSession(plans, session.id);
  if (!plan && viewer === "player") return null;
  const base = viewer === "coach" ? "/calendar" : "/me/calendar";

  return (
    <section id="plan" aria-labelledby="session-plan" className={cardClass({ className: "mt-4" })}>
      <h2 id="session-plan" className="text-lg font-bold text-ink">
        Plan
      </h2>
      {!plan ? (
        <p className="mt-1 text-sm text-ink-soft">
          No plan for this session.{" "}
          <Link href="/library/plans" className="inline-flex min-h-11 items-center font-semibold text-brand-strong hover:underline">
            Choose a plan in Library
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <p className="min-w-0 font-semibold text-ink">{plan.title}</p>
            <p className="shrink-0">
              <span className="text-2xl font-bold tabular-nums text-ink">{totalMinutes(plan)}</span>
              <span className="ml-1 text-sm text-ink-soft">min</span>
            </p>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {itemsByBlock(plan)
              .filter((b) => b.items.length > 0)
              .map((b) => (
                <li key={b.id} className="flex justify-between gap-3">
                  <span className="text-ink">{b.label}</span>
                  <span className="text-ink-soft">
                    {b.items.length} exercise{b.items.length === 1 ? "" : "s"} · {b.items.reduce((n, i) => n + i.durationMin, 0)} min
                  </span>
                </li>
              ))}
          </ul>
          <Link href={`${base}/${session.id}/plan`} className={buttonClass({ variant: "secondary", block: true, className: "mt-3" })}>
            Open plan
          </Link>
        </>
      )}
    </section>
  );
}
