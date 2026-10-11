// Fictional demo data. Will be replaced by a real data source in a later phase.
import type { Assignment, Exercise, ExerciseCategory, ExerciseDiscipline } from "./types";
import { participants } from "./groups";

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
    description: "Gets the whole group moving and ready to train.",
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
    description: "Keeping possession under pressure with quick passing.",
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
    description: "Quick decisions and finishing against a defender.",
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
    description: "Layup rhythm and soft touch with both hands.",
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
    description: "Low defensive stance and lateral speed.",
    discipline: "Basketball",
    category: "Conditioning",
    durationMin: 6,
    equipment: "Cones",
    instructions: "Slide lane-line to lane-line staying low, without crossing feet. 6 × 20 seconds with 40 seconds rest.",
  },
  {
    id: "e6",
    title: "Serve toss consistency",
    description: "A repeatable ball toss for a more reliable serve.",
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
    description: "Faster first step after the opponent's shot.",
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
    description: "Classic Pilates core warm-up with breathing.",
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
    description: "Gentle mobility for hips and upper back.",
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
  // Jordan Hale gets The Hundred twice: with his Pilates group and individually in basketball.
  {
    id: "a-seed-6",
    exerciseId: "e8",
    groupId: "g2",
    audience: "selected",
    participantIds: ["p12"],
    customInstructions: "Jordan: add this to your routine before basketball sessions.",
    assignedOn: "2026-10-10",
  },
];

// ---------------------------------------------------------------------------
// Video links: only YouTube and Vimeo in this first version (we never host videos).

export type VideoProvider = "YouTube" | "Vimeo";

/** The provider of a YouTube or Vimeo video link, or null if it is not one. */
export function videoProvider(value: string): VideoProvider | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const path = url.pathname;
  if (host === "youtu.be") return /^\/[\w-]{6,}$/.test(path) ? "YouTube" : null;
  if (host === "youtube.com") {
    if (path === "/watch") return /^[\w-]{6,}$/.test(url.searchParams.get("v") ?? "") ? "YouTube" : null;
    return /^\/(shorts|embed|live)\/[\w-]{6,}$/.test(path) ? "YouTube" : null;
  }
  if (host === "vimeo.com") return /^\/\d+(\/[\w]+)?$/.test(path) ? "Vimeo" : null;
  if (host === "player.vimeo.com") return /^\/video\/\d+$/.test(path) ? "Vimeo" : null;
  return null;
}

/** Provider name for display, also for the demo's YouTube search links. */
export function videoSourceLabel(value: string) {
  const provider = videoProvider(value);
  if (provider) return provider;
  try {
    return new URL(value).hostname.includes("youtube.") ? "YouTube" : "video site";
  } catch {
    return "video site";
  }
}

// ---------------------------------------------------------------------------
// Which exercises a participant should see.

/** True if the assignment applies to this participant (whole group, or selected individually). */
export function assignmentIncludes(a: Assignment, participantId: string) {
  const member = participants.some((p) => p.id === participantId && p.groupId === a.groupId);
  return member && (a.audience === "group" || a.participantIds.includes(participantId));
}

/**
 * The exercises a participant should see across all their groups, each listed once,
 * with every assignment that makes it visible (group-wide or individual).
 */
export function exercisesForParticipant(participantId: string, exercises: Exercise[], assignments: Assignment[]) {
  const byExercise = new Map<string, Assignment[]>();
  for (const a of assignments) {
    if (!assignmentIncludes(a, participantId)) continue;
    byExercise.set(a.exerciseId, [...(byExercise.get(a.exerciseId) ?? []), a]);
  }
  return exercises
    .filter((e) => byExercise.has(e.id))
    .map((exercise) => ({ exercise, via: byExercise.get(exercise.id)! }));
}
