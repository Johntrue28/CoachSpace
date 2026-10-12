// Every scenario at once, for the server only: `generateStaticParams` uses it so pages for the
// ids of all four scenarios are built in advance. Never import this from a client component;
// the browser loads scenarios one at a time (see ./index.ts).
import { tennis } from "./tennis";
import { football } from "./football";
import { basketball } from "./basketball";
import { pilates } from "./pilates";
import type { ScenarioData } from "./types";

export const allScenarios: ScenarioData[] = [tennis, football, basketball, pilates];

/** The ids `pick` returns for any scenario, each once, as route params. */
export function paramsFromAllScenarios(pick: (s: ScenarioData) => string[]) {
  return [...new Set(allScenarios.flatMap(pick))].map((id) => ({ id }));
}

/** The groups the demo participant belongs to in a scenario. */
export function demoParticipantGroupIds(s: ScenarioData) {
  return s.participants.filter((p) => p.id === s.demoParticipantId).map((p) => p.groupId);
}
