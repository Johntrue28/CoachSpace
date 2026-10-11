// Fictional demo data. Will be replaced by a real data source in a later phase.
import type { Assignment, Exercise, ExerciseCategory, ExerciseDiscipline } from "./types";

export const exerciseCategories: ExerciseCategory[] = [
  "Warm-up",
  "Technique",
  "Tactics",
  "Strength",
  "Conditioning",
  "Mobility",
];

export const exerciseDisciplines: ExerciseDiscipline[] = ["General", "Football", "Basketball", "Tennis", "Pilates"];

/** Builds a YouTube search link, so demo videos never point to a broken or unrelated video. */
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export const seedExercises: Exercise[] = [
  {
    id: "e1",
    title: "Dynamic warm-up routine",
    discipline: "General",
    category: "Warm-up",
    durationMin: 10,
    equipment: "Cones",
    instructions:
      "Jog 2 laps, then 10 m each of high knees, heel flicks, side shuffles and carioca. Finish with 3 progressive sprints at 70%, 80% and 90%.",
    videoUrl: yt("dynamic warm up routine for sport"),
  },
  {
    id: "e2",
    title: "Rondo 4v1",
    discipline: "Football",
    category: "Technique",
    durationMin: 12,
    equipment: "Balls, cones (8×8 m square)",
    instructions:
      "Four players on the outside keep possession against one defender in the middle. Two-touch maximum. The player who loses the ball swaps with the defender.",
    videoUrl: yt("rondo 4v1 football drill"),
  },
  {
    id: "e3",
    title: "1v1 finishing",
    discipline: "Football",
    category: "Tactics",
    durationMin: 15,
    equipment: "Balls, goal, cones",
    instructions:
      "Attacker receives a pass from the halfway line and goes 1v1 against a defender. Shoot within 6 seconds. Rotate roles after each go.",
  },
  {
    id: "e4",
    title: "Mikan drill",
    discipline: "Basketball",
    category: "Technique",
    durationMin: 8,
    equipment: "Ball, hoop",
    instructions:
      "Alternate right- and left-hand layups under the basket without letting the ball touch the floor. 3 sets of 30 seconds.",
    videoUrl: yt("mikan drill basketball"),
  },
  {
    id: "e5",
    title: "Defensive slides",
    discipline: "Basketball",
    category: "Conditioning",
    durationMin: 6,
    equipment: "Cones",
    instructions: "Slide lane-line to lane-line staying low, without crossing feet. 6 × 20 seconds with 40 seconds rest.",
  },
  {
    id: "e6",
    title: "Serve toss consistency",
    discipline: "Tennis",
    category: "Technique",
    durationMin: 10,
    equipment: "Balls, racket",
    instructions:
      "Toss the ball without hitting and let it land. It should land just inside the baseline, in front of the leading foot. 20 tosses, then 20 serves.",
    videoUrl: yt("tennis serve toss drill"),
  },
  {
    id: "e7",
    title: "Split-step reaction",
    discipline: "Tennis",
    category: "Conditioning",
    durationMin: 8,
    equipment: "Balls",
    instructions:
      "Split-step as the coach feeds; react to the direction and touch the ball. 4 sets of 10 feeds.",
  },
  {
    id: "e8",
    title: "The Hundred",
    discipline: "Pilates",
    category: "Strength",
    durationMin: 5,
    equipment: "Mat",
    instructions:
      "Lie on your back, legs in tabletop, head and shoulders lifted. Pump the arms while breathing in for 5 counts and out for 5 counts, 10 times.",
    videoUrl: yt("pilates the hundred tutorial"),
  },
  {
    id: "e9",
    title: "Hip and thoracic mobility flow",
    discipline: "General",
    category: "Mobility",
    durationMin: 8,
    equipment: "Mat",
    instructions:
      "World's greatest stretch, 90/90 hip switches and open books. 5 slow repetitions of each per side.",
  },
];

export const seedAssignments: Assignment[] = [
  // Same warm-up reused in two groups with different instructions.
  {
    id: "a-seed-1",
    exerciseId: "e1",
    groupId: "g1",
    audience: "group",
    participantIds: [],
    customInstructions: "Shorter version for U12: 1 lap jog, then the drills at a relaxed pace. Skip the 90% sprint.",
    assignedOn: "2026-10-05",
  },
  {
    id: "a-seed-2",
    exerciseId: "e1",
    groupId: "g2",
    audience: "group",
    participantIds: [],
    customInstructions: "",
    assignedOn: "2026-10-05",
  },
  // Only for selected participants.
  {
    id: "a-seed-3",
    exerciseId: "e6",
    groupId: "g3",
    audience: "selected",
    participantIds: ["p20", "p24"],
    customInstructions: "Beginners: 10 tosses and 10 serves only. Focus on a relaxed tossing arm.",
    assignedOn: "2026-10-08",
  },
  {
    id: "a-seed-4",
    exerciseId: "e8",
    groupId: "g4",
    audience: "group",
    participantIds: [],
    customInstructions: "",
    assignedOn: "2026-10-09",
  },
  {
    id: "a-seed-5",
    exerciseId: "e9",
    groupId: "g4",
    audience: "selected",
    participantIds: ["p29"],
    customInstructions: "Diana: only 3 repetitions per side and stop if you feel pain in the knee.",
    assignedOn: "2026-10-09",
  },
];
