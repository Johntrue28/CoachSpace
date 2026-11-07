"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScenario } from "@/data/scenario-store";
import { SCENARIO_IDS, loadScenario, scenarioProfile, scenarioProfiles, type ScenarioId } from "@/data/scenarios";
import { WELCOME_PATH } from "@/data/persistence";
import ResetDemoButton from "@/components/ResetDemoButton";
import { CheckIcon } from "@/components/Icons";
import StatusMessage, { LiveStatus } from "@/components/ui/StatusMessage";
import ScenarioCover from "@/components/demo/ScenarioCover";
import { t } from "@/i18n";

/**
 * Settings → Demo (D-055): the active demo scenario, a compact switcher using the same scenario
 * system as the welcome screen (D-053), and the demo data resets. Switching deletes nothing: each
 * scenario keeps its own changes in this browser.
 */
export default function DemoScenarioSettings() {
  const router = useRouter();
  const { scenario, activate, resetAll, notice, clearNotice } = useScenario();
  const [switching, setSwitching] = useState<ScenarioId | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    for (const id of SCENARIO_IDS) loadScenario(id).catch(() => {});
  }, []);

  // After a switch the app is mounted again: confirm it and keep the keyboard focus in this section.
  useEffect(() => {
    if (!notice) return;
    setStatus(notice);
    clearNotice();
    headingRef.current?.focus();
  }, [notice, clearNotice]);

  async function choose(id: ScenarioId) {
    if (id === scenario) return;
    setError("");
    setSwitching(id);
    try {
      await activate(id);
    } catch {
      setSwitching(null);
      setError(t("demoSettings.error"));
    }
  }

  function resetEverything() {
    const ok = window.confirm(
      t("demoSettings.resetAllConfirm"),
    );
    if (!ok) return;
    resetAll();
    router.push(WELCOME_PATH);
  }

  const active = scenarioProfile(scenario);

  return (
    <div data-active-scenario={scenario}>
      <h2 id="demo-heading" ref={headingRef} tabIndex={-1} className="text-lg font-bold text-ink outline-none">
        {t("demoSettings.title")}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        {t("demoSettings.showing", { name: active.name, organisation: active.organisation })}
      </p>

      <LiveStatus message={status} className="mt-4" />
      {error && (
        <StatusMessage tone="error" className="mt-4">
          {error}
        </StatusMessage>
      )}

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label={t("demoSettings.list")}>
        {scenarioProfiles.map((p) => {
          const current = p.id === scenario;
          return (
            <li key={p.id} className="min-w-0">
              <button
                type="button"
                onClick={() => choose(p.id)}
                disabled={switching !== null}
                aria-pressed={current}
                className={`flex w-full items-center gap-3 rounded-control p-2 text-left ring-1 transition disabled:cursor-wait ${
                  current ? "bg-brand-soft ring-brand" : "bg-card ring-line hover:bg-surface"
                }`}
              >
                <span className="w-16 shrink-0 overflow-hidden rounded-[0.5rem]">
                  <ScenarioCover scenario={p.id} className="aspect-video" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                  <span className={`block truncate text-xs ${current ? "font-semibold text-brand-strong" : "text-ink-soft"}`}>
                    {switching === p.id ? t("demoSettings.switching") : current ? t("demoSettings.active") : p.organisation}
                  </span>
                </span>
                {current && <CheckIcon className="h-4 w-4 shrink-0 text-brand-strong" />}
              </button>
            </li>
          );
        })}
      </ul>
      <Link href={WELCOME_PATH} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong hover:underline">
        {t("demoSettings.welcome")}
      </Link>

      <div className="mt-4 border-t border-line pt-5">
        <h3 className="text-sm font-semibold text-ink">{t("demoSettings.data")}</h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          {t("demoSettings.dataHint", { name: active.name })}
        </p>
        <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-2">
          <div className="w-fit">
            <ResetDemoButton />
          </div>
          <button type="button" onClick={resetEverything} className="inline-flex min-h-11 items-center text-xs font-semibold text-danger underline">
            {t("demoSettings.resetAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
