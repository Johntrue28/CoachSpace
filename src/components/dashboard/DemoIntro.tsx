"use client";

import Link from "next/link";
import { coach, sessionWords } from "@/data/groups";
import { dismissIntro } from "@/data/persistence";
import { useAttendanceSetting } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { useNow } from "@/components/useNow";

/**
 * A short, dismissible introduction on the coach dashboard (D-055, audit F-01): what CoachSpace is
 * for, three things worth trying, and what the demo does not do. Once closed it stays closed in this
 * browser; CSS hides it before the first paint (see `scenarioBootScript`), so it never flashes.
 */
export default function DemoIntro() {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  const attendance = useAttendanceSetting();
  const next = now && ready ? upcoming(now, { limit: 1, activeOnly: true })[0] : undefined;

  const steps = [
    {
      href: next ? `/calendar/${next.id}` : "/calendar",
      title: `Open the next ${sessionWords().one}`,
      text: "Its plan, place, group and notes in one place.",
    },
    attendance.enabled
      ? { href: "/attendance", title: "Take attendance", text: "Everyone starts as present: tap only who is missing." }
      : { href: "/library/plans", title: "Plan a session", text: "Build it from your exercise library." },
    { href: "/me", title: "See the participant view", text: "What a participant sees for the same groups." },
  ];

  return (
    <section
      data-intro
      aria-labelledby="demo-intro-heading"
      className="relative overflow-hidden rounded-card bg-brand-soft p-4 ring-1 ring-brand/20 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="demo-intro-heading" className="text-base font-bold text-ink">
            Welcome to {coach.organisation}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink">
            You are {coach.name}. CoachSpace keeps sessions, attendance, training plans and messages for every group
            together, so information is written once instead of repeated in every chat.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissIntro}
          className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-control text-ink-soft transition hover:bg-card hover:text-ink"
          aria-label="Close the introduction"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <ol className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="min-w-0">
            <Link
              href={s.href}
              // Fully prefetched (D-070): the first things a visitor taps open without waiting.
              prefetch
              className="flex h-full min-h-11 items-start gap-3 rounded-control bg-card p-3 shadow-card ring-1 ring-line transition hover:ring-brand/40"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-strong text-xs font-bold text-on-brand" aria-hidden="true">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{s.title}</span>
                <span className="block text-xs text-ink-soft">{s.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-ink">
        Fictional data. Nothing is sent to anyone: changes stay in this browser. Switch sport or reset in Settings → Demo.
      </p>
    </section>
  );
}
