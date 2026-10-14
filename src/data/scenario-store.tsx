"use client";

// Demo scenario provider (D-053).
// Remembers which scenario this browser shows, applies it before the user sees the page, and
// mounts the rest of the app again whenever the scenario changes, so no component keeps data
// from the previous one. This is a founder tool for preparing demonstrations; it is not a way to
// switch organisations and it is not access control.

import { createContext, Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { applyScenario, activeScenarioId } from "./scenario";
import { DEFAULT_SCENARIO, SCENARIO_IDS, defaultScenarioData, loadScenario, scenarioProfile, type ScenarioId } from "./scenarios";
import { clearAllDemoStates, clearDemoState, loadActiveScenario, saveActiveScenario } from "./persistence";

type ScenarioStore = {
  /** The scenario whose data the app shows. */
  scenario: ScenarioId;
  /** Loads and applies a scenario; its saved changes (if any) come back with it. */
  activate: (id: ScenarioId) => Promise<void>;
  /** Removes one scenario's saved changes. If it is active, its fictional data is shown again at once. */
  resetScenario: (id: ScenarioId) => void;
  /** Removes the changes of every scenario and returns to the default scenario. */
  resetAll: () => void;
  /** A confirmation to show after the app was mounted again (it would be lost otherwise). */
  notice: string | null;
  clearNotice: () => void;
};

const ScenarioContext = createContext<ScenarioStore | null>(null);

// Start downloading a saved non-default scenario as early as possible, while React hydrates.
const saved = typeof window === "undefined" ? null : loadActiveScenario();
const early = saved && saved !== DEFAULT_SCENARIO ? loadScenario(saved) : null;

function reveal() {
  document.documentElement.removeAttribute("data-scenario-loading");
}

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  // Always the default on the first render, which is what the server rendered.
  const [scenario, setScenario] = useState<ScenarioId>(DEFAULT_SCENARIO);
  // Changes when a scenario's data is reset, to mount the app again with fresh state.
  const [generation, setGeneration] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const clearNotice = useCallback(() => setNotice(null), []);

  // Before the first paint after hydration, and before the stores read their seed: move the seeded
  // dates to the current week (seed-dates.ts), then switch to the saved scenario if there is one.
  useLayoutEffect(() => {
    if (!early) {
      applyScenario(defaultScenarioData, new Date());
      return reveal();
    }
    let cancelled = false;
    early
      .then((data) => {
        if (cancelled) return;
        // Another example was chosen meanwhile (a direct link on the welcome screen): keep that one.
        if (loadActiveScenario() !== data.id) return reveal();
        applyScenario(data, new Date());
        setScenario(data.id);
      })
      .catch(reveal);
    return () => {
      cancelled = true;
    };
  }, []);

  // Show the page once the app has been rendered with the right scenario.
  useEffect(() => {
    if (!early || scenario === saved) reveal();
  }, [scenario]);

  const activate = useCallback(async (id: ScenarioId) => {
    const data = await loadScenario(id);
    applyScenario(data, new Date());
    saveActiveScenario(id);
    setScenario(id);
    setNotice(`${scenarioProfile(id).name} is now active. Every page shows its fictional data.`);
  }, []);

  const resetScenario = useCallback((id: ScenarioId) => {
    clearDemoState(id);
    if (id === activeScenarioId()) setGeneration((g) => g + 1);
  }, []);

  const resetAll = useCallback(() => {
    clearAllDemoStates(SCENARIO_IDS);
    loadScenario(DEFAULT_SCENARIO).then((data) => {
      applyScenario(data, new Date());
      setScenario(DEFAULT_SCENARIO);
      setGeneration((g) => g + 1);
      setNotice(`All scenarios were reset. ${scenarioProfile(DEFAULT_SCENARIO).name} is active.`);
    });
  }, []);

  const value = useMemo(
    () => ({ scenario, activate, resetScenario, resetAll, notice, clearNotice }),
    [scenario, activate, resetScenario, resetAll, notice, clearNotice],
  );

  return (
    <ScenarioContext.Provider value={value}>
      <Fragment key={`${scenario}:${generation}`}>{children}</Fragment>
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const store = useContext(ScenarioContext);
  if (!store) throw new Error("useScenario must be used inside <ScenarioProvider>");
  return store;
}
