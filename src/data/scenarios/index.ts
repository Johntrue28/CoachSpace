// Scenario registry (D-053). The default scenario is part of the main bundle because the server
// renders it; the other three are loaded only when they are previewed or activated, so normal
// pages never download data they do not show.
import { tennis } from "./tennis";
import { DEFAULT_SCENARIO, type ScenarioData, type ScenarioId, type ScenarioProfile } from "./types";

export * from "./types";

const loaders: Record<ScenarioId, () => Promise<ScenarioData>> = {
  tennis: async () => tennis,
  football: () => import("./football").then((m) => m.football),
  basketball: () => import("./basketball").then((m) => m.basketball),
  pilates: () => import("./pilates").then((m) => m.pilates),
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
    name: "Tennis Club",
    sport: "Tennis",
    organisation: "Harbour Lane Tennis Club",
    coachName: "Laura Gomez",
    audience: "Tennis clubs and independent coaches who run junior and adult group programmes.",
    groupExamples: ["U16 Development", "U18 Performance", "Adult Beginners", "Adult Improvers", "Club Competition Team"],
    showcases: [
      "Juniors and adults on different courts and levels",
      "Serve, footwork and doubles drills in the library",
      "League match messages and squad announcements",
    ],
    coverAlt: "Illustration of a coach feeding balls to two players on a tennis court.",
  },
  {
    id: "football",
    name: "Football Academy",
    sport: "Football",
    organisation: "Northgate Football Academy",
    coachName: "Daniel Reyes",
    audience: "Academies and clubs with youth squads and adult teams training several times a week.",
    groupExamples: ["U16 Development", "U18 Academy", "Senior Amateur", "Adult Recreational"],
    showcases: [
      "Squads on two pitches and a sports hall",
      "Rondos, scanning, pressing and possession games",
      "Fixture changes and video reviews for each squad",
    ],
    coverAlt: "Illustration of a coach leading a passing drill with players on a football pitch.",
  },
  {
    id: "basketball",
    name: "Basketball Club",
    sport: "Basketball",
    organisation: "Eastfield Basketball Club",
    coachName: "Maya Brooks",
    audience: "Basketball clubs with youth development teams, senior squads and recreational sessions.",
    groupExamples: ["U16 Development", "U18 Performance", "Senior Amateur", "Adult Recreational"],
    showcases: [
      "Teams sharing the main court and Court 2",
      "Ball handling, shooting, closeouts and 3v3 games",
      "Scouting clips, court changes and game-day messages",
    ],
    coverAlt: "Illustration of a coach teaching players on an indoor basketball court.",
  },
  {
    id: "pilates",
    name: "Pilates Studio",
    sport: "Pilates",
    organisation: "Calma Pilates Studio",
    coachName: "Clara Hughes",
    audience: "Pilates instructors and small studios running reformer and mat classes.",
    groupExamples: ["Reformer Pilates — Beginners", "Mat Pilates — All Levels", "Reformer Pilates — Intermediate", "Mobility and Core", "Small Group Pilates"],
    showcases: [
      "Reformer classes with a capacity of 10, mat classes of 14",
      "Exercises with cues, modifications and a safety note",
      "Class changes and studio reminders for clients",
    ],
    coverAlt: "Illustration of an instructor leading a reformer Pilates class in a bright studio.",
  },
];

export function scenarioProfile(id: ScenarioId) {
  return scenarioProfiles.find((p) => p.id === id)!;
}
