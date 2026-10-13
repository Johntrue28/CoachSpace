// Session plans and coach notes of the active demo scenario (D-053). The seeds live in
// src/data/scenarios/; only src/data/scenario.ts changes these bindings.
import type { CoachNote, SessionPlan } from "./types";
import { tennis } from "./scenarios/tennis";
import type { ScenarioData } from "./scenarios/types";

export let seedPlans: SessionPlan[] = tennis.plans;

/** One note from an earlier session, so "from last time" has something to show. */
export let seedNotes: CoachNote[] = tennis.notes;

/** Points the bindings above at another scenario. Called by src/data/scenario.ts only. */
export function setCoachingData(data: ScenarioData) {
  seedPlans = data.plans;
  seedNotes = data.notes;
}
