// Exercise library of the active demo scenario (D-053). The seeds live in src/data/scenarios/;
// only src/data/scenario.ts changes these bindings.
import type { Assignment, Exercise, ExerciseCategory, ExerciseDiscipline } from "./types";
import { participants } from "./groups";
import { tennis } from "./scenarios/tennis";
import type { ScenarioData } from "./scenarios/types";
import { t } from "@/i18n";

export const exerciseCategories: ExerciseCategory[] = [
  "Warm-up",
  "Technique",
  "Tactics",
  "Strength",
  "Conditioning",
  "Mobility",
];

/** Sports offered in the library filters and the exercise form: "General" and the scenario's sport. */
export let exerciseDisciplines: ExerciseDiscipline[] = tennis.disciplines;

export let seedExercises: Exercise[] = tennis.exercises;

export let seedAssignments: Assignment[] = tennis.assignments;

/** Points the bindings above at another scenario. Called by src/data/scenario.ts only. */
export function setExerciseData(data: ScenarioData) {
  exerciseDisciplines = data.disciplines;
  seedExercises = data.exercises;
  seedAssignments = data.assignments;
}

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
    return new URL(value).hostname.includes("youtube.") ? "YouTube" : t("video.site");
  } catch {
    return "video site";
  }
}

/**
 * What an exercise's link is (D-057): a specific YouTube or Vimeo video, a YouTube *search* for
 * example videos (the seeded exercises use these, because no specific video could be checked), or
 * another link. Only "video" may be presented as a video.
 */
export type VideoLinkKind = "video" | "search" | "other";

export function videoLinkKind(value: string): VideoLinkKind {
  if (videoProvider(value)) return "video";
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    if (host === "youtube.com" && url.pathname === "/results" && url.searchParams.get("search_query")) return "search";
  } catch {
    // not a URL
  }
  return "other";
}

/**
 * True for an http or https address. Only these are ever rendered as links (D-069), so a value such
 * as `javascript:…` saved in this browser can never become a clickable script.
 */
export function isWebUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/** True only when the exercise links to a specific video (not a search). */
export function hasVideo(exercise: { videoUrl?: string }) {
  return !!exercise.videoUrl && videoLinkKind(exercise.videoUrl) === "video";
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
