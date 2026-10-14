// Direct links to one demo example (audit R-08), for example `/demo?sport=tennis` in a personal
// email. Pure function, no React. Only the four scenario ids are accepted: the link chooses which
// fictional example opens, and can never add or change any data.
import { isScenarioId, type ScenarioId } from "./scenarios/types";

/** The query parameter of a direct link. */
export const SCENARIO_LINK_PARAM = "sport";

/** The scenario a link's query string asks for, or null when it asks for none or an unknown one. */
export function scenarioFromLink(search: string): ScenarioId | null {
  const value = new URLSearchParams(search).get(SCENARIO_LINK_PARAM);
  return isScenarioId(value) ? value : null;
}
