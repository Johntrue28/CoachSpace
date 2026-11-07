// Exercise Library list rules (redesign step R8): filters, order and the "Used in" text.
// Pure functions, no React (unit tested), shared by the coach's Library and the participant's Exercises.
import type { Assignment, Exercise, ExerciseCategory } from "./types";
import { exerciseCategories } from "./exercises";
import { t, tn } from "@/i18n";

export type LibraryFilter = {
  query?: string;
  category?: ExerciseCategory | "All";
};

/** The exercises that match the search and category, in session order (warm-up first, mobility last). One sport per scenario, so no sport filter (D-076). */
export function filterExercises<T extends Exercise>(exercises: T[], { query = "", category = "All" }: LibraryFilter = {}): T[] {
  const q = query.trim().toLowerCase();
  return exercises
    .filter(
      (e) =>
        (category === "All" || e.category === category) &&
        (!q || [e.title, e.description ?? "", e.category, e.equipment ?? ""].some((text) => text.toLowerCase().includes(q))),
    )
    .map((e, i) => ({ e, i }))
    .sort((a, b) => exerciseCategories.indexOf(a.e.category) - exerciseCategories.indexOf(b.e.category) || a.i - b.i)
    .map(({ e }) => e);
}

/** Only the categories a list uses (a scenario may not use "Tactics"), in session order, plus the selected one. */
export function usedCategories(exercises: Pick<Exercise, "category">[], selected: ExerciseCategory | "All" = "All") {
  return exerciseCategories.filter((c) => c === selected || exercises.some((e) => e.category === c));
}

/** How many different groups an exercise is assigned to. */
export function groupsUsing(assignments: Pick<Assignment, "exerciseId" | "groupId">[], exerciseId: string) {
  return new Set(assignments.filter((a) => a.exerciseId === exerciseId).map((a) => a.groupId)).size;
}

/** "Not assigned yet", "Used in 1 group", "Used in 3 groups". */
export function usageLabel(groups: number) {
  if (groups === 0) return t("library.notAssigned");
  return tn("library.usedIn", groups);
}
