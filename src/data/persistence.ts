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

/** Storage key of one scenario's demo chat (D-060): messages typed in this browser and read state. */
export function chatStorageKey(scenario: ScenarioId) {
  return `${storageKey(scenario)}:chat`;
}

export type SavedChat = {
  messages: { id: string; conversationId: string; senderId: string; body: string; sentAt: string; local: true }[];
  readState: Record<string, Record<string, string>>;
};

const isString = (v: unknown): v is string => typeof v === "string";

/** Checks the shape of a saved chat, so corrupt or foreign data is ignored rather than shown. */
export function parseSavedChat(raw: string | null, scenario: ScenarioId): SavedChat | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { scenario?: unknown; messages?: unknown; readState?: unknown };
    if (data.scenario !== scenario || !Array.isArray(data.messages) || typeof data.readState !== "object" || data.readState === null) return null;
    const messages = data.messages.filter(
      (m): m is SavedChat["messages"][number] =>
        !!m && isString(m.id) && isString(m.conversationId) && isString(m.senderId) && isString(m.body) && isString(m.sentAt) && !Number.isNaN(Date.parse(m.sentAt)),
    );
    const readState: SavedChat["readState"] = {};
    for (const [viewer, conversations] of Object.entries(data.readState as Record<string, unknown>)) {
      if (!conversations || typeof conversations !== "object") continue;
      readState[viewer] = Object.fromEntries(Object.entries(conversations as Record<string, unknown>).filter(([, at]) => isString(at)) as [string, string][]);
    }
    return { messages: messages.map((m) => ({ id: m.id, conversationId: m.conversationId, senderId: m.senderId, body: m.body, sentAt: m.sentAt, local: true })), readState };
  } catch {
    return null;
  }
}

export function loadChatState(scenario: ScenarioId): SavedChat | null {
  try {
    return parseSavedChat(window.localStorage.getItem(chatStorageKey(scenario)), scenario);
  } catch {
    return null;
  }
}

export function saveChatState(scenario: ScenarioId, chat: SavedChat) {
  try {
    window.localStorage.setItem(chatStorageKey(scenario), JSON.stringify({ scenario, ...chat }));
  } catch {
    // ignore: the chat still works for this visit
  }
}

/** Removes one scenario's saved changes, its demo chat included. */
export function clearDemoState(scenario: ScenarioId) {
  try {
    window.localStorage.removeItem(chatStorageKey(scenario));
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
    for (const s of scenarios) {
      window.localStorage.removeItem(storageKey(s));
      window.localStorage.removeItem(chatStorageKey(s));
    }
    window.localStorage.removeItem(ACTIVE_KEY);
    window.localStorage.removeItem(INTRO_KEY);
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

/** Set when the visitor closes the dashboard introduction (D-055); one per browser, not per scenario. */
const INTRO_KEY = "coachspace-intro-dismissed";
/** On <html> while the introduction is closed, so CSS hides it before the first paint. */
export const INTRO_DISMISSED_ATTR = "data-intro-dismissed";

/** Closes the dashboard introduction in this browser. */
export function dismissIntro() {
  document.documentElement.setAttribute(INTRO_DISMISSED_ATTR, "");
  try {
    window.localStorage.setItem(INTRO_KEY, "1");
  } catch {
    // ignore: it is simply shown again next time
  }
}

/** Where a new visitor starts (D-055). */
export const WELCOME_PATH = "/demo";

/**
 * Inline script for the page <head>, run before the first paint:
 * - a visitor who opens `/` and has never chosen a scenario in this browser is sent to the welcome
 *   screen (D-055). Only when this browser can store the choice, so a blocked storage can never
 *   send the visitor round in a loop;
 * - while a scenario other than the default is being applied, the page is hidden, so the default
 *   scenario's content never flashes (D-053);
 * - a closed dashboard introduction stays hidden (D-055).
 * The CSS for `data-scenario-loading` (globals.css) shows the page again after a few seconds in any
 * case, so a failed script can never leave it hidden.
 */
export const scenarioBootScript = `try{var d=document.documentElement,s=localStorage.getItem(${JSON.stringify(ACTIVE_KEY)});if(!s&&location.pathname==="/"){localStorage.setItem("coachspace-probe","1");localStorage.removeItem("coachspace-probe");d.setAttribute("data-scenario-loading","");location.replace(${JSON.stringify(
  WELCOME_PATH,
)});}else if(${JSON.stringify(SCENARIO_IDS.filter((id) => id !== DEFAULT_SCENARIO))}.indexOf(s)>-1)d.setAttribute("data-scenario-loading","");if(localStorage.getItem(${JSON.stringify(INTRO_KEY)}))d.setAttribute(${JSON.stringify(INTRO_DISMISSED_ATTR)},"")}catch(e){}`;
