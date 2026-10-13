"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScenario } from "@/data/scenario-store";
import { loadActiveScenario } from "@/data/persistence";
import { SCENARIO_IDS, loadScenario, scenarioProfiles, type ScenarioId } from "@/data/scenarios";
import Logo from "@/components/shell/Logo";
import { ArrowRightIcon } from "@/components/Icons";
import StatusMessage from "@/components/ui/StatusMessage";
import ScenarioCover from "./ScenarioCover";

/**
 * The welcome screen (D-055): the first page a new visitor sees. It explains CoachSpace in two
 * sentences and offers the four demo scenarios (D-053) as cards. Choosing one makes it the active
 * scenario and opens the coach dashboard. It is not a sign-in and not an account: nothing is created
 * and nothing is sent. The same scenario system is used by the switcher in Settings.
 */
export default function Welcome() {
  const router = useRouter();
  const { scenario, activate, clearNotice } = useScenario();
  const [opening, setOpening] = useState<ScenarioId | null>(null);
  const [error, setError] = useState("");
  // The scenario this browser explored before, if any (only known in the browser).
  const [previous, setPrevious] = useState<ScenarioId | null>(null);

  useEffect(() => {
    setPrevious(loadActiveScenario());
    // Fetch the other scenarios' data in the background, so a choice opens at once.
    for (const id of SCENARIO_IDS) loadScenario(id).catch(() => {});
    router.prefetch("/");
  }, [router]);

  async function choose(id: ScenarioId) {
    setError("");
    setOpening(id);
    try {
      if (id !== scenario || previous !== id) await activate(id);
      clearNotice();
      router.push("/");
    } catch {
      setOpening(null);
      setError("This example could not be opened. Check the connection and try again.");
    }
  }

  return (
    <main id="welcome" className="min-h-dvh bg-canvas">
      <div className="mx-auto w-full max-w-screen-xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10 lg:px-9">
        <header className="flex items-center justify-between gap-4">
          <Logo href="/demo" />
          <p className="text-xs font-semibold text-ink-soft">Interactive demo</p>
        </header>

        <section aria-labelledby="welcome-heading" className="mt-8 max-w-3xl sm:mt-14">
          <h1 id="welcome-heading" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Try CoachSpace with your sport
          </h1>
          <p className="mt-3 text-base text-ink-soft sm:text-lg">
            One place for a coach’s groups, sessions, attendance, training plans and messages. Choose the example closest
            to your club and explore it as the coach.
          </p>
        </section>

        {error && (
          <StatusMessage tone="error" className="mt-6 max-w-3xl">
            {error}
          </StatusMessage>
        )}

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4" aria-label="Demo examples">
          {scenarioProfiles.map((p) => {
            const busy = opening === p.id;
            return (
              <li key={p.id} className="min-w-0">
                <article
                  data-scenario={p.id}
                  className="group relative flex h-full overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line transition focus-within:ring-2 focus-within:ring-brand hover:shadow-raised sm:flex-col"
                >
                  <div className="w-28 shrink-0 self-stretch sm:w-auto">
                    <ScenarioCover scenario={p.id} alt={p.coverAlt} className="h-full sm:h-auto sm:aspect-video" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-strong">{p.sport}</p>
                    <h2 className="mt-0.5 text-lg font-bold text-ink">{p.name}</h2>
                    <p className="mt-1 text-sm text-ink-soft">{p.summary}</p>
                    <p className="mt-2 hidden text-xs text-ink-soft sm:block">
                      {p.organisation} · {p.coachName}
                    </p>
                    {previous === p.id && <p className="mt-2 text-xs font-semibold text-ink">Explored last time</p>}
                    <div className="mt-auto pt-3 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => choose(p.id)}
                        disabled={opening !== null}
                        aria-busy={busy || undefined}
                        className="inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-semibold text-brand-strong outline-none after:absolute after:inset-0 after:content-[''] disabled:opacity-60 sm:w-full sm:justify-center sm:bg-brand-strong sm:px-4 sm:text-on-brand sm:shadow-brand sm:group-hover:bg-brand-hover"
                      >
                        {busy ? "Opening…" : `Explore ${p.name}`}
                        {!busy && <ArrowRightIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 max-w-3xl text-sm text-ink-soft">
          No sign-in needed. The clubs and people are fictional, and nothing you do is sent to anyone: changes stay in this
          browser. You can switch to another sport or reset the demo at any time in Settings.
        </p>
      </div>
    </main>
  );
}
