// Fictional demo data for the session builder and coach memory.
import type { CoachNote, SessionPlan } from "./types";

export const seedPlans: SessionPlan[] = [
  {
    id: "t-football",
    kind: "template",
    title: "Football technique session",
    groupId: null,
    sessionId: null,
    copiedFromId: null,
    items: [
      { id: "t-football-1", exerciseId: "e1", block: "warm-up", durationMin: 10, instructions: "" },
      { id: "t-football-2", exerciseId: "e2", block: "technical", durationMin: 15, instructions: "" },
      { id: "t-football-3", exerciseId: "e3", block: "tactical", durationMin: 20, instructions: "" },
      { id: "t-football-4", exerciseId: "e9", block: "cool-down", durationMin: 8, instructions: "" },
    ],
    updatedAt: "2026-10-05T10:00:00+02:00",
  },
  {
    id: "t-basketball",
    kind: "template",
    title: "Basketball defence session",
    groupId: null,
    sessionId: null,
    copiedFromId: null,
    items: [
      { id: "t-basketball-1", exerciseId: "e1", block: "warm-up", durationMin: 10, instructions: "" },
      { id: "t-basketball-2", exerciseId: "e4", block: "technical", durationMin: 8, instructions: "" },
      { id: "t-basketball-3", exerciseId: "e5", block: "tactical", durationMin: 12, instructions: "" },
      { id: "t-basketball-4", exerciseId: "e9", block: "cool-down", durationMin: 8, instructions: "" },
    ],
    updatedAt: "2026-10-05T10:00:00+02:00",
  },
];

/** One note from an earlier U12 Football session, so "from last time" has something to show. */
export const seedNotes: CoachNote[] = [
  {
    sessionId: "g1-2026-10-07",
    groupId: "g1",
    worked: "High intensity in the rondo; everyone kept the two-touch rule.",
    improve: "Passing with the weaker foot.",
    revisit: "Finish with 1v1 finishing; we ran out of time.",
    savedAt: "2026-10-07T19:30:00+02:00",
  },
];
