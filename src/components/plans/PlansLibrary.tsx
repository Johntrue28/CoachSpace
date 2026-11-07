"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { totalMinutes } from "@/data/plans";
import { colourOf, groupName } from "@/data/groups";
import { sessionStart } from "@/data/calendar";
import { formatDateKey } from "@/components/format";
import { useNow } from "@/components/useNow";
import { ChevronRightIcon, PlusIcon } from "@/components/Icons";
import { listClass } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import LibraryTabs from "@/components/library/LibraryTabs";
import { buttonClass } from "@/components/ui/Button";
import EmptyState, { Loading } from "@/components/ui/EmptyState";

/**
 * Library → Plans (D-076): every plan of the coach with its group, total minutes in large type and the sessions it
 * is used in. Plans are created and edited here and used in sessions from the plan's page; any plan can be reused.
 */
export default function PlansLibrary() {
  const router = useRouter();
  const { plans, ready, createPlan } = useDemoStore();
  const sessions = useSessions();
  const now = useNow();

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title="Library"
        description="Build plans from your exercises and use them in your sessions."
        action={
          <button type="button" onClick={() => router.push(`/library/plans/${createPlan({ title: "New plan" }).id}`)} className={buttonClass()}>
            <PlusIcon className="h-4 w-4" /> New plan
          </button>
        }
      />
      <div className="mt-5">
        <LibraryTabs current="plans" />
      </div>

      {!ready || !sessions.ready ? (
        <Loading block />
      ) : plans.length === 0 ? (
        <EmptyState className="mt-6 max-w-3xl" title="No plans yet" description="Create one with New plan." />
      ) : (
        <ul className={listClass("mt-6 max-w-3xl")} aria-label="Plans">
          {plans.map((p) => {
            const used = p.sessionIds.map((id) => sessions.byId(id)).filter((s) => s !== undefined);
            const next = now ? used.filter((s) => sessionStart(s) > now).sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())[0] : undefined;
            return (
              <li key={p.id}>
                <Link href={`/library/plans/${p.id}`} className="press group flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{p.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-soft">
                      {p.groupId && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colourOf(p.groupId).solid }} aria-hidden="true" />}
                      {p.groupId ? groupName(p.groupId) : "Any group"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-brand-strong">
                      {used.length === 0
                        ? "Not used in a session yet"
                        : `Used in ${used.length} session${used.length === 1 ? "" : "s"}${next ? ` · next ${formatDateKey(next.date)}, ${next.time}` : ""}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-xl font-bold tabular-nums text-ink">{totalMinutes(p)}</span>
                    <span className="block text-xs text-ink-soft">min</span>
                  </span>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
