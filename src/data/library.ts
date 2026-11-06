// Exercise Library list rules (redesign step R8): filters, order and the "Used in" text.
// Pure functions, no React (unit tested), shared by the coach's Library and the participant's Exercises.
import type { Assignment, Exercise, ExerciseCategory, ExerciseDiscipline } from "./types";
import { exerciseCategories } from "./exercises";

export type LibraryFilter = {
  query?: string;
  discipline?: ExerciseDiscipline | "All";
  category?: ExerciseCategory | "All";
};

/** The exercises that match the search, sport and category, in session order (warm-up first, mobility last). */
export function filterExercises<T extends Exercise>(exercises: T[], { query = "", discipline = "All", category = "All" }: LibraryFilter = {}): T[] {
  const q = query.trim().toLowerCase();
  return exercises
    .filter(
      (e) =>
        (discipline === "All" || e.discipline === discipline) &&
        (category === "All" || e.category === category) &&
        (!q || [e.title, e.description ?? "", e.category, e.equipment ?? ""].some((text) => text.toLowerCase().includes(q))),
    )
    .map((e, i) => ({ e, i }))
    .sort((a, b) => exerciseCategories.indexOf(a.e.category) - exerciseCategories.indexOf(b.e.category) || a.i - b.i)
    .map(({ e }) => e);
}

/** Only the categories a list uses (Pilates has no "Tactics"), in session order, plus the selected one. */
export function usedCategories(exercises: Pick<Exercise, "category">[], selected: ExerciseCategory | "All" = "All") {
  return exerciseCategories.filter((c) => c === selected || exercises.some((e) => e.category === c));
}

/** How many different groups an exercise is assigned to. */
export function groupsUsing(assignments: Pick<Assignment, "exerciseId" | "groupId">[], exerciseId: string) {
  return new Set(assignments.filter((a) => a.exerciseId === exerciseId).map((a) => a.groupId)).size;
}

/** "Not assigned yet", "Used in 1 group", "Used in 3 groups". */
export function usageLabel(groups: number) {
  if (groups === 0) return "Not assigned yet";
  return `Used in ${groups} group${groups === 1 ? "" : "s"}`;
}
