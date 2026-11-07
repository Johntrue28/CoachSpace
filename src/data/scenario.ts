// Switching the active demo scenario (D-053). Plain module, no React: the provider in
// src/data/scenario-store.tsx calls it in the browser, and the unit tests call it directly.
//
// Every data module keeps "live" bindings (`export let`) to the active scenario's data. This
// function points all of them at the same scenario at once, so groups, participants, sessions,
// exercises, messages and plans can never come from two different scenarios.
import { setGroupData } from "./groups";
import { setMessageData } from "./messages";
import { setExerciseData } from "./exercises";
import { setCoachingData } from "./coaching";
import { setSessionTopics } from "./calendar";
import { tennis } from "./scenarios/tennis";
import { datedScenario } from "./seed-dates";
import type { ScenarioData, ScenarioId } from "./scenarios/types";

let active: ScenarioData = tennis;

/** The scenario whose data the app currently shows. */
export function activeScenarioId(): ScenarioId {
  return active.id;
}

/** The active scenario's full data set. */
export function activeScenario() {
  return active;
}

/**
 * Makes `data` the active scenario everywhere. With `now` (in the browser), its seeded messages,
 * announcements, assignments, plans and notes are first moved to the current week (seed-dates.ts).
 */
export function applyScenario(seed: ScenarioData, now?: Date) {
  const data = now ? datedScenario(seed, now) : seed;
  setGroupData(data);
  setMessageData(data);
  setExerciseData(data);
  setCoachingData(data);
  setSessionTopics(data);
  active = data;
}
