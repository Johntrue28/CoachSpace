"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { DEMO_PARTICIPANT_ID, colourOf, groupById, groupIdsOf } from "@/data/groups";
import { planForSession, planTimeline } from "@/data/plans";
import { videoLinkKind } from "@/data/exercises";
import { formatDateKey } from "@/components/format";
import BackLink from "@/components/navigation/BackLink";
import VideoLink from "@/components/library/VideoLink";
import { cardClass } from "@/components/ui/Card";
import { Loading } from "@/components/ui/EmptyState";

/**
 * The plan of one session, read-only and easy to read (D-076): each exercise with its start and end minute,
 * its minutes, coaching points and video (a real video only, never a search link), and the total. The same view for the coach and the players; only
 * the coach gets the small "Edit in Library" link. Plans are changed in Library, never here.
 */
export default function PlanView({ sessionId, viewer }: { sessionId: string; viewer: "coach" | "player" }) {
  const { ready, byId } = useSessions();
  const { plans, exercises, ready: storeReady } = useDemoStore();
  const base = viewer === "coach" ? "/calendar" : "/me/calendar";
  const session = ready ? byId(sessionId) : undefined;
  const group = session && groupById(session.groupId);
  const allowed = viewer === "coach" || (group && groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id));

  if (!ready || !storeReady) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <Loading block />
      </main>
    );
  }
  const plan = session && allowed ? planForSession(plans, session.id) : undefined;
  if (!session || !group || !allowed || !plan) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <BackLink fallback={session ? `${base}/${sessionId}` : base === "/calendar" ? "/" : "/me"} fallbackLabel="Session" />
        <p className="mt-6 text-sm text-ink-soft">No plan for this session.</p>
      </main>
    );
  }
  const { blocks, total } = planTimeline(plan, exercises);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback={`${base}/${session.id}`} fallbackLabel="Session" />
      <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colourOf(group.id).solid }} aria-hidden="true" />
        {group.name} · {formatDateKey(session.date)}, {session.time}
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{plan.title}</h1>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-ink">{total}</span>
        <span className="text-sm font-semibold text-ink-soft">min in total</span>
      </p>

      {blocks.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">This plan has no exercises yet.</p>
      ) : (
        <div className="mt-5 space-y-5">
          {blocks.map((b) => (
            <section key={b.id} aria-labelledby={`block-${b.id}`}>
              <h2 id={`block-${b.id}`} className="px-1 text-xs font-bold uppercase tracking-wide text-planning">
                {b.label}
              </h2>
              <ol className={cardClass({ padded: false, className: "mt-2 divide-y divide-line" })}>
                {b.steps.map((st) => (
                  <li key={st.id} className="flex gap-3 px-4 py-3.5">
                    <p className="w-16 shrink-0 text-sm font-bold tabular-nums text-brand-strong">
                      {st.start}–{st.end}′
                    </p>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-semibold text-ink">{st.title}</h3>
                        <span className="shrink-0 text-sm text-ink-soft">{st.minutes} min</span>
                      </div>
                      {st.text && <p className="mt-0.5 text-sm text-ink-soft">{st.text}</p>}
                      {st.coachingPoints.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-ink">
                          {st.coachingPoints.map((point) => (
                            <li key={point} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                      {st.videoUrl && videoLinkKind(st.videoUrl) === "video" && <VideoLink url={st.videoUrl} audience={viewer === "coach" ? "coach" : "participant"} className="mt-2" />}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {viewer === "coach" && (
        <p className="mt-6 text-center">
          <Link href={`/library/plans/${plan.id}`} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-strong hover:underline">
            Edit in Library
          </Link>
        </p>
      )}
    </main>
  );
}
