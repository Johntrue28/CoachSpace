"use client";

import { useEffect, useRef, useState } from "react";
import { useScenario } from "@/data/scenario-store";
import { hasSavedState } from "@/data/persistence";
import {
  DEFAULT_SCENARIO,
  SCENARIO_IDS,
  loadScenario,
  scenarioProfile,
  scenarioProfiles,
  type ScenarioData,
  type ScenarioId,
} from "@/data/scenarios";
import { scheduleLabel } from "@/data/groups";
import ScenarioCover from "./ScenarioCover";
import Badge from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import StatusMessage, { LiveStatus } from "@/components/ui/StatusMessage";
import { CheckIcon } from "@/components/Icons";

/**
 * Demo Studio (D-053): a presenter page for preparing CoachSpace for one prospective customer.
 * Four scenarios share the same application; choosing one swaps the fictional data everywhere.
 * Not part of the coach or participant experience, not in the navigation, and not protected.
 */
export default function DemoStudio() {
  const { scenario, activate, resetScenario, resetAll, notice, clearNotice } = useScenario();
  const [preview, setPreview] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState<ScenarioId | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const previewRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLHeadingElement>(null);
  const active = scenarioProfile(scenario);

  const refreshSaved = () => setSaved(Object.fromEntries(SCENARIO_IDS.map((id) => [id, hasSavedState(id)])));

  // Read what is saved in this browser, and download the other scenarios in the background so
  // previews and activation are instant.
  useEffect(() => {
    refreshSaved();
    for (const id of SCENARIO_IDS) loadScenario(id).catch(() => {});
  }, []);

  // After a scenario change the app is mounted again: show the confirmation and put the focus
  // back on the active scenario, so keyboard and screen reader users keep their place.
  useEffect(() => {
    if (!notice) return;
    setStatus(notice);
    clearNotice();
    activeRef.current?.focus();
  }, [notice, clearNotice]);

  async function showPreview(id: ScenarioId) {
    setError("");
    setLoading(id);
    try {
      setPreview(await loadScenario(id));
      requestAnimationFrame(() => previewRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
    } catch {
      setError("This scenario could not be loaded. Check the connection and try again.");
    } finally {
      setLoading(null);
    }
  }

  async function choose(id: ScenarioId) {
    setError("");
    setLoading(id);
    try {
      await activate(id); // the page is mounted again with the new scenario
    } catch {
      setLoading(null);
      setError("This scenario could not be loaded. Check the connection and try again.");
    }
  }

  function reset(id: ScenarioId) {
    const name = scenarioProfile(id).name;
    const ok = window.confirm(
      `Reset ${name}? Everything changed in this scenario in this browser (exercises, assignments, announcements, attendance, calendar changes, plans, notes and settings) will be removed and its fictional data restored. The other scenarios are not affected.`,
    );
    if (!ok) return;
    resetScenario(id);
    refreshSaved();
    setStatus(`${name} restored to its fictional data.`);
  }

  function resetEverything() {
    const ok = window.confirm(
      "Reset all four scenarios? Every change saved in this browser for any scenario will be removed, and the demo returns to Tennis Club.",
    );
    if (ok) resetAll();
  }

  return (
    <main data-active-scenario={scenario} className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-strong">For presenters</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Demo Studio</h1>
      <p className="mt-1.5 max-w-3xl text-sm text-ink-soft">
        Prepare CoachSpace for the person you are meeting. Every scenario is the same app with fictional data for a
        different kind of coach: groups, participants, schedules, exercises, plans, announcements, chat and attendance all
        change together.
      </p>

      <StatusMessage tone="demo" className="mt-4 max-w-3xl">
        This page is a presenter tool, not part of CoachSpace for coaches or participants. It is not in the navigation,
        but it is not protected either: the demo has no sign-in, so anyone with the link can open it.
      </StatusMessage>

      <LiveStatus message={status} className="mt-4 max-w-3xl" />
      {error && (
        <StatusMessage tone="error" className="mt-4 max-w-3xl">
          {error}
        </StatusMessage>
      )}

      <section aria-labelledby="active-heading" className={cardClass({ className: "mt-6 sm:p-6" })}>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Active scenario</p>
        <h2 id="active-heading" ref={activeRef} tabIndex={-1} className="mt-1 text-xl font-bold text-ink outline-none">
          {active.name}
          <span className="font-normal text-ink-soft"> · {active.organisation}</span>
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {active.coachName} is the coach; Jordan Hale is the fictional participant in the participant view.
          {scenario === DEFAULT_SCENARIO && " This is the default scenario."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/" size="sm">
            Open the coach dashboard
          </ButtonLink>
          <ButtonLink href="/me" variant="secondary" size="sm">
            Open the participant view
          </ButtonLink>
          {scenario !== DEFAULT_SCENARIO && (
            <Button variant="secondary" size="sm" onClick={() => choose(DEFAULT_SCENARIO)} disabled={loading !== null}>
              Return to {scenarioProfile(DEFAULT_SCENARIO).name} (default)
            </Button>
          )}
        </div>
      </section>

      <h2 className="mt-8 text-lg font-bold text-ink">Choose a scenario</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Activating a scenario deletes nothing: each one keeps its own changes in this browser, and they come back when you
        return to it. Chat messages typed during a demo are never saved.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {scenarioProfiles.map((p) => {
          const isActive = p.id === scenario;
          return (
            <li key={p.id}>
              <article
                aria-labelledby={`scenario-${p.id}`}
                className={cardClass({
                  padded: false,
                  className: `flex h-full flex-col overflow-hidden ${isActive ? "ring-2 ring-brand" : ""}`,
                })}
              >
                <div className="relative">
                  <ScenarioCover scenario={p.id} alt={p.coverAlt} />
                  {isActive && (
                    <Badge tone="solid-brand" className="absolute left-3 top-3 shadow-raised">
                      <CheckIcon className="h-3.5 w-3.5" /> Active
                    </Badge>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-strong">{p.sport}</p>
                  <h3 id={`scenario-${p.id}`} className="mt-0.5 text-lg font-bold text-ink">
                    {p.name}
                  </h3>
                  <p className="text-sm font-medium text-ink">{p.organisation}</p>
                  <p className="mt-2 text-sm text-ink-soft">{p.audience}</p>
                  <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Groups and classes</h4>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.groupExamples.map((g) => (
                      <li key={g} className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink">
                        {g}
                      </li>
                    ))}
                  </ul>
                  <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">What it shows</h4>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink">
                    {p.showcases.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {isActive ? (
                      <ButtonLink href="/" size="sm">
                        Open dashboard
                      </ButtonLink>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => choose(p.id)}
                        disabled={loading !== null}
                        aria-label={`Activate ${p.name}`}
                        aria-busy={loading === p.id}
                      >
                        {loading === p.id ? "Activating…" : "Activate"}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => showPreview(p.id)}
                      disabled={loading !== null}
                      aria-label={`Preview ${p.name}`}
                      aria-expanded={preview?.id === p.id}
                      aria-controls="scenario-preview"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {preview && (
        <ScenarioPreview
          ref={previewRef}
          data={preview}
          isActive={preview.id === scenario}
          busy={loading !== null}
          onActivate={() => choose(preview.id)}
          onClose={() => setPreview(null)}
        />
      )}

      <section aria-labelledby="data-heading" className={cardClass({ className: "mt-8 sm:p-6" })}>
        <h2 id="data-heading" className="text-lg font-bold text-ink">
          Demo data in this browser
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Changes made during a demo are saved only in this browser, separately for each scenario. Resetting removes them
          and restores the fictional data. Nothing is stored on a server.
        </p>
        <ul className="mt-4 divide-y divide-line">
          {scenarioProfiles.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {p.name}
                  {p.id === scenario && <span className="font-normal text-ink-soft"> · active</span>}
                </p>
                <p className="text-sm text-ink-soft">{saved[p.id] ? "Has changes saved in this browser" : "No saved changes"}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => reset(p.id)} disabled={!saved[p.id]} aria-label={`Reset ${p.name}`}>
                Reset
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-line pt-4">
          <Button variant="danger-soft" size="sm" onClick={resetEverything}>
            Reset all scenarios
          </Button>
          <p className="mt-1.5 text-xs text-ink-soft">Removes the changes of all four scenarios and returns to Tennis Club.</p>
        </div>
      </section>
    </main>
  );
}

/** What a scenario contains, shown before activating it. Previewing changes nothing. */
function ScenarioPreview({
  ref,
  data,
  isActive,
  busy,
  onActivate,
  onClose,
}: {
  ref: React.Ref<HTMLElement>;
  data: ScenarioData;
  isActive: boolean;
  busy: boolean;
  onActivate: () => void;
  onClose: () => void;
}) {
  const profile = scenarioProfile(data.id);
  const people = new Set(data.participants.map((p) => p.id)).size;
  const sessionsPerWeek = data.groups.reduce((n, g) => n + g.slots.length, 0);
  const jordanGroups = data.participants.filter((p) => p.id === data.demoParticipantId).map((p) => data.groups.find((g) => g.id === p.groupId)?.name);

  return (
    <section
      id="scenario-preview"
      ref={ref}
      aria-label="Scenario preview"
      className={cardClass({ className: "mt-6 scroll-mt-[calc(var(--shell-header-h)+1rem)] sm:p-6" })}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Preview · nothing changes until you activate it</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{profile.name}</h2>
          <p className="text-sm text-ink-soft">
            {data.coach.name}, {data.coach.organisation} · {data.groups.length} groups · {people} participants · {sessionsPerWeek} sessions a week
          </p>
        </div>
        <div className="flex gap-2">
          {isActive ? (
            <Badge tone="brand">Active</Badge>
          ) : (
            <Button size="sm" onClick={onActivate} disabled={busy} aria-label={`Activate ${profile.name} from the preview`}>
              Activate this scenario
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close preview
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Groups and weekly schedule</h3>
          <ul className="mt-2 divide-y divide-line text-sm">
            {data.groups.map((g) => {
              const members = data.participants.filter((p) => p.groupId === g.id).length;
              return (
                <li key={g.id} className="py-2">
                  <p className="font-medium text-ink">{g.name}</p>
                  <p className="text-ink-soft">
                    {scheduleLabel(g)} · {g.venue} · {members} participants{g.capacity !== undefined && ` of ${g.capacity} places`}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-ink">Exercise Library ({data.exercises.length} exercises)</h3>
            <p className="mt-1 text-ink-soft">{data.exercises.slice(0, 6).map((e) => e.title).join(" · ")}…</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Session plans</h3>
            <p className="mt-1 text-ink-soft">{data.plans.map((p) => p.title).join(" · ")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Announcements and chat</h3>
            <p className="mt-1 text-ink-soft">
              {data.announcements.length} announcements, for example “{data.announcements[0]?.title}”. {data.conversations.length}{" "}
              conversations with {data.chatMessages.length} fictional messages.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Participant view</h3>
            <p className="mt-1 text-ink-soft">Jordan Hale, in {jordanGroups.join(" and ")}.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
