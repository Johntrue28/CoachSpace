"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { templatesOf, totalMinutes } from "@/data/plans";
import { groups } from "@/data/groups";
import type { SessionPlan } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { BookIcon, ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { formatDateKey } from "@/components/format";
import { listClass, rowLinkClass } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import LibraryTabs from "@/components/library/LibraryTabs";
import { buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";

/** Session plans tab of the library (D-048): reusable templates and the plans adapted for each group. */
export default function PlansLibrary() {
  const router = useRouter();
  const { plans, ready, createPlan } = useDemoStore();
  const { byId } = useSessions();
  const templates = templatesOf(plans);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title="Library"
        description="Build sessions from your library exercises and reuse them across your groups."
        action={
          <button
            type="button"
            onClick={() => router.push(`/library/plans/${createPlan({ kind: "template", title: "New template" }).id}`)}
            className={buttonClass()}
          >
            <PlusIcon className="h-4 w-4" /> New template
          </button>
        }
      />
      <div className="mt-5">
        <LibraryTabs current="plans" />
      </div>

      {!ready ? (
        <Loading block />
      ) : (
        <div className="mt-6 space-y-6">
          <section aria-labelledby="plans-templates">
            <h2 id="plans-templates" className="mb-3 text-sm font-bold text-ink">
              Templates <span className="font-normal text-ink-soft">({templates.length})</span>
            </h2>
            {templates.length === 0 ? (
              <p className="max-w-3xl rounded-card bg-card p-4 text-sm text-ink-soft ring-1 ring-line">No templates yet.</p>
            ) : (
              <PlanList plans={templates} detail={() => "Template"} />
            )}
          </section>

          {groups.map((g) => {
            const list = plans.filter((p) => p.kind === "plan" && p.groupId === g.id);
            if (list.length === 0) return null;
            return (
              <section key={g.id} aria-labelledby={`plans-${g.id}`}>
                <h2 id={`plans-${g.id}`} className="mb-3 text-sm font-bold text-ink">
                  {g.name} <span className="font-normal text-ink-soft">({list.length})</span>
                </h2>
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
          <p className="hidden text-sm text-ink-soft sm:block">
            Plan a specific session from its page in the calendar. Copies never change the template they come from.
          </p>
        </div>
      )}

      <div className="mt-8">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}

function PlanList({ plans, detail }: { plans: SessionPlan[]; detail: (p: SessionPlan) => string }) {
  return (
    <ul className={listClass("max-w-3xl")}>
      {plans.map((p) => (
        <li key={p.id}>
          <Link href={`/library/plans/${p.id}`} className={`${rowLinkClass} group`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-planning-soft text-planning" aria-hidden="true">
              <BookIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ink">{p.title}</span>
              <span className="block truncate text-sm text-ink-soft">
                {detail(p)} · {p.items.length} exercise{p.items.length === 1 ? "" : "s"} · {totalMinutes(p)} min
              </span>
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
