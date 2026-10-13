// Local persistence for the demo store. This is the only place that touches localStorage,
// so a future backend can replace it without changing the UI (see docs/ARCHITECTURE.md).
//
// Each demo scenario (D-053) keeps its own saved changes under its own key, tagged with the
// scenario id, so data from two scenarios can never be mixed. The active scenario is a separate
// key. Data saved by earlier versions under "coachspace-demo-v1" belonged to the old mixed-sport
// demo; it is never read and is removed by "Reset all scenarios".
import { DEFAULT_SCENARIO, SCENARIO_IDS, isScenarioId, type ScenarioId } from "./scenarios/types";

const PREFIX = "coachspace-demo-v2:";
const ACTIVE_KEY = "coachspace-scenario";
const LEGACY_KEY = "coachspace-demo-v1";

/** Storage key of one scenario's saved changes. */
export function storageKey(scenario: ScenarioId) {
  return PREFIX + scenario;
}

/**
 * Reads the saved demo data of one scenario. Fields missing from older saves fall back to
 * `seed`, so data saved before a feature existed still loads. Returns null when nothing usable
 * is saved, or when what is saved belongs to another scenario.
 */
export function loadDemoState<T extends Record<string, unknown>>(scenario: ScenarioId, seed: T, required: (keyof T)[]): T | null {
  try {
    const raw = window.localStorage.getItem(storageKey(scenario));
    if (!raw) return null;
    const { scenario: savedFor, ...parsed } = JSON.parse(raw) as Partial<T> & { scenario?: string };
    if (savedFor !== scenario) return null;
    if (required.some((k) => (parsed as Partial<T>)[k] === undefined)) return null;
    return { ...seed, ...parsed };
  } catch {
    return null;
  }
}

export function saveDemoState(scenario: ScenarioId, state: object) {
  try {
    window.localStorage.setItem(storageKey(scenario), JSON.stringify({ scenario, ...state }));
  } catch {
    // Storage can be unavailable (private mode, blocked). The demo still works for this visit.
  }
}

/** Removes one scenario's saved changes. */
export function clearDemoState(scenario: ScenarioId) {
  try {
    window.localStorage.removeItem(storageKey(scenario));
  } catch {
    // ignore
  }
}

/** Whether a scenario has changes saved in this browser. */
export function hasSavedState(scenario: ScenarioId) {
  try {
    return window.localStorage.getItem(storageKey(scenario)) !== null;
  } catch {
    return false;
  }
}

/** Removes every scenario's saved changes and the remembered scenario (plus data from older versions). */
export function clearAllDemoStates(scenarios: readonly ScenarioId[]) {
  try {
    for (const s of scenarios) window.localStorage.removeItem(storageKey(s));
    window.localStorage.removeItem(ACTIVE_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}

/** The scenario chosen in the Demo Studio on this browser, if any (and if still valid). */
export function loadActiveScenario(): ScenarioId | null {
  try {
    const value = window.localStorage.getItem(ACTIVE_KEY);
    return isScenarioId(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveActiveScenario(scenario: ScenarioId) {
  try {
    window.localStorage.setItem(ACTIVE_KEY, scenario);
  } catch {
    // ignore
  }
}

/**
 * Inline script for the page <head>: before the first paint, hides the page while a scenario
 * other than the default is being applied, so the default scenario's content never flashes.
 * The CSS for `data-scenario-loading` (globals.css) shows the page again after a few seconds
 * in any case, so a failed script can never leave it hidden.
 */
export const scenarioBootScript = `try{var s=localStorage.getItem(${JSON.stringify(ACTIVE_KEY)});if(${JSON.stringify(
  SCENARIO_IDS.filter((id) => id !== DEFAULT_SCENARIO),
)}.indexOf(s)>-1)document.documentElement.setAttribute("data-scenario-loading","")}catch(e){}`;
