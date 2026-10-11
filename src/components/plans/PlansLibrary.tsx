"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { templatesOf, totalMinutes } from "@/data/plans";
import { groups } from "@/data/groups";
import type { SessionPlan } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { formatDateKey } from "@/components/format";
import BackLink from "@/components/navigation/BackLink";
import { buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";

/** Reusable coaching library: session templates and the plans adapted for each group. */
export default function PlansLibrary() {
  const router = useRouter();
  const { plans, ready, createPlan } = useDemoStore();
  const { byId } = useSessions();
  const templates = templatesOf(plans);

  return (
    <main className="px-4 pt-6">
      <BackLink fallback="/library" fallbackLabel="Library" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Session plans</h1>
          <p className="mt-1 text-sm text-ink-soft">Build sessions from your library exercises and reuse them.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/library/plans/${createPlan({ kind: "template", title: "New template" }).id}`)}
          className={buttonClass({ size: "sm", className: "shrink-0" })}
        >
          <PlusIcon className="h-4 w-4" /> Template
        </button>
      </div>

      {!ready ? (
        <Loading block />
      ) : (
        <>
          <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Templates</h2>
          {templates.length === 0 ? (
            <p className="rounded-2xl bg-card p-4 text-sm text-ink-soft ring-1 ring-line">No templates yet.</p>
          ) : (
            <PlanList plans={templates} detail={() => "Template"} />
          )}

          {groups.map((g) => {
            const list = plans.filter((p) => p.kind === "plan" && p.groupId === g.id);
            if (list.length === 0) return null;
            return (
              <section key={g.id}>
                <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{g.name}</h2>
                <PlanList
                  plans={list}
                  detail={(p) => {
                    const s = p.sessionId ? byId(p.sessionId) : undefined;
                    return s ? `${formatDateKey(s.date)}, ${s.time}` : "Not linked to a session";
                  }}
                />
              </section>
            );
          })}
          <p className="mt-4 text-xs text-ink-soft">
            Plan a specific session from its page in the calendar. Copies never change the template they come from.
          </p>
        </>
      )}

      <div className="mt-6">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}

function PlanList({ plans, detail }: { plans: SessionPlan[]; detail: (p: SessionPlan) => string }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card ring-1 ring-line">
      {plans.map((p) => (
        <li key={p.id}>
          <Link href={`/library/plans/${p.id}`} className="flex items-center gap-3 p-4 hover:bg-surface">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.title}</p>
              <p className="text-xs text-ink-soft">
                {detail(p)} · {p.items.length} exercise{p.items.length === 1 ? "" : "s"} · {totalMinutes(p)} min
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
