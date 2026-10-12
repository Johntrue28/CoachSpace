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
import { setPlanBlockLabels } from "./plans";
import { tennis } from "./scenarios/tennis";
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

/** Makes `data` the active scenario everywhere. */
export function applyScenario(data: ScenarioData) {
  setGroupData(data);
  setMessageData(data);
  setExerciseData(data);
  setCoachingData(data);
  setSessionTopics(data);
  setPlanBlockLabels(data.planBlockLabels);
  active = data;
}
