"use client";

import Link from "next/link";
import { coach } from "@/data/groups";
import { dismissIntro } from "@/data/persistence";
import { useSessions } from "@/data/use-sessions";
import { useNow } from "@/components/useNow";

/**
 * The demo explained once, in a few lines that can be closed (D-071, replaces the large dashboard
 * introduction of D-055 on the home). Uses the same "closed" flag, so CSS hides it before the first paint.
 */
export default function DemoGuide() {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  const next = now && ready ? upcoming(now, { limit: 1, activeOnly: true })[0] : undefined;
  const steps = [
    { href: next ? `/calendar/${next.id}` : "/calendar", text: "Open a session to see who's coming" },
    { href: "/me", text: "Switch to Player and answer" },
    { href: "/library", text: "Plan with your exercise library" },
  ];
  return (
    <section data-intro aria-label="About this demo" className="rounded-card bg-brand-soft px-4 py-3 ring-1 ring-brand/20">
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-sm text-ink">
          <span className="font-semibold">Demo · you are {coach.name}.</span> Fictional data; nothing is sent to anyone and
          changes stay in this browser.
        </p>
        <button
          type="button"
          onClick={dismissIntro}
          className="-mr-2 -mt-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-control text-ink-soft transition hover:bg-card hover:text-ink"
          aria-label="Close the demo guide"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <ol className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {steps.map((s, i) => (
          <li key={s.text}>
            <Link href={s.href} prefetch className="font-semibold text-brand-strong underline-offset-2 hover:underline">
              {i + 1}. {s.text}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
