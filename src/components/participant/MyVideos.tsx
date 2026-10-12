"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseCategories, exercisesForParticipant } from "@/data/exercises";
import { DEMO_PARTICIPANT_ID, groupIdsOf, groupName } from "@/data/groups";
import type { Assignment, ExerciseCategory } from "@/data/types";
import { ChevronRightIcon, PlayIcon } from "@/components/Icons";
import { Loading } from "@/components/ui/EmptyState";

/** How an assignment reaches the participant: "Morning Pilates" or "Senior Basketball · just for you". */
export function viaLabel(a: Assignment) {
  return a.audience === "selected" ? `${groupName(a.groupId)} · just for you` : groupName(a.groupId);
}

/**
 * "My Videos": every exercise assigned to the demo participant across all their groups,
 * each shown once even when several assignments make it visible.
 */
export default function MyVideos() {
  const { exercises, assignments, ready } = useDemoStore();
  const myGroups = groupIdsOf(DEMO_PARTICIPANT_ID);
  const [group, setGroup] = useState<string>("All");
  const [category, setCategory] = useState<ExerciseCategory | "All">("All");

  const mine = exercisesForParticipant(DEMO_PARTICIPANT_ID, exercises, assignments);
  const shown = mine.filter(
    ({ exercise, via }) =>
      (group === "All" || via.some((a) => a.groupId === group)) && (category === "All" || exercise.category === category),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-8">
      <h1 className="text-2xl font-bold">My Videos</h1>
      <p className="mt-1 text-sm text-ink-soft">Exercises and videos from your coach, for all your groups.</p>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by group">
        {["All", ...myGroups].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setGroup(id)}
            aria-pressed={group === id}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
              group === id ? "bg-brand-strong text-on-brand ring-brand" : "bg-card text-ink ring-line"
            }`}
          >
            {id === "All" ? "All groups" : groupName(id)}
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExerciseCategory | "All")}
          className="w-full rounded-xl bg-card px-3 py-2.5 text-sm ring-1 ring-line outline-none focus:ring-brand"
        >
          <option value="All">All categories</option>
          {exerciseCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      {!ready ? (
        <Loading block />
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">
          {mine.length === 0 ? "Your coach has not assigned any exercises yet." : "No exercises match your filters."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map(({ exercise, via }) => (
            <li key={exercise.id}>
              <Link
                href={`/me/videos/${exercise.id}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line hover:ring-brand"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{exercise.title}</p>
                  {exercise.description && <p className="truncate text-sm text-ink-soft">{exercise.description}</p>}
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-soft">
                    <span>
                      {exercise.category} · {exercise.durationMin} min
                    </span>
                    {exercise.videoUrl && (
                      <span className="flex items-center gap-1">
                        <PlayIcon className="h-3.5 w-3.5" /> Video
                      </span>
                    )}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-1">
                    {via.map((a) => (
                      <span key={a.id} className="rounded-full bg-brand-soft px-2 py-0.5 text-label font-medium text-brand-strong">
                        {viaLabel(a)}
                      </span>
                    ))}
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
