// Scenario registry (D-053). The default scenario is part of the main bundle because the server
// renders it; the other two are loaded only when they are previewed or activated, so normal
// pages never download data they do not show.
import { tennis } from "./tennis";
import { DEFAULT_SCENARIO, type ScenarioData, type ScenarioId, type ScenarioProfile } from "./types";
import { t } from "@/i18n";

export * from "./types";

const loaders: Record<ScenarioId, () => Promise<ScenarioData>> = {
  tennis: async () => tennis,
  football: () => import("./football").then((m) => m.football),
  basketball: () => import("./basketball").then((m) => m.basketball),
};

const cache = new Map<ScenarioId, Promise<ScenarioData>>([[DEFAULT_SCENARIO, Promise.resolve(tennis)]]);

/** Loads a scenario's data (once; later calls reuse the same promise). */
export function loadScenario(id: ScenarioId): Promise<ScenarioData> {
  let pending = cache.get(id);
  if (!pending) {
    pending = loaders[id]();
    // A failed download (offline) must not be cached, so a later try can succeed.
    pending.catch(() => cache.delete(id));
    cache.set(id, pending);
  }
  return pending;
}

export const defaultScenarioData = tennis;

/** What the Demo Studio cards show. Kept small and separate from the data itself. */
export const scenarioProfiles: ScenarioProfile[] = [
  {
    id: "tennis",
    get name() {
      return t("scenario.tennis.name");
    },
    sport: "Tennis",
    organisation: "Laura Gomez Tennis",
    coachName: "Laura Gomez",
    get summary() {
      return t("scenario.tennis.summary");
    },
    get coverAlt() {
      return t("scenario.tennis.coverAlt");
    },
  },
  {
    id: "football",
    get name() {
      return t("scenario.football.name");
    },
    sport: "Football",
    organisation: "Northgate Football Academy",
    coachName: "Daniel Reyes",
    get summary() {
      return t("scenario.football.summary");
    },
    get coverAlt() {
      return t("scenario.football.coverAlt");
    },
  },
  {
    id: "basketball",
    get name() {
      return t("scenario.basketball.name");
    },
    sport: "Basketball",
    organisation: "Eastfield Basketball Club",
    coachName: "Maya Brooks",
    get summary() {
      return t("scenario.basketball.summary");
    },
    get coverAlt() {
      return t("scenario.basketball.coverAlt");
    },
  },
];

export function scenarioProfile(id: ScenarioId) {
  return scenarioProfiles.find((p) => p.id === id)!;
}
