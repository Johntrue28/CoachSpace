"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { exercisesForParticipant, hasVideo } from "@/data/exercises";
import { usedCategories } from "@/data/library";
import { DEMO_PARTICIPANT_ID, groupIdsOf, groupName } from "@/data/groups";
import type { Assignment, ExerciseCategory } from "@/data/types";
import { BookIcon, ChevronRightIcon, PlayIcon } from "@/components/Icons";
import { listClass, rowLinkClass } from "@/components/ui/Card";
import { ChipRow, FilterChip } from "@/components/ui/FilterChip";
import EmptyState, { Loading } from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";

/** How an assignment reaches the participant: "U16 Development" or "Senior Basketball · just for you". */
export function viaLabel(a: Assignment) {
  return a.audience === "selected" ? `${groupName(a.groupId)} · just for you` : groupName(a.groupId);
}

/**
 * The participant's Exercises (Figma participant My Videos, D-052; R8 list rows): every exercise
 * assigned to the demo participant across all their groups, each shown once even when several
 * assignments make it visible. Group and category filters are one scrolling row each.
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

  const categories = usedCategories(
    mine.map((m) => m.exercise),
    category,
  );

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader title="Exercises" description="Exercises and training videos from your coach, for all your groups." />

      <ChipRow label="Filter by group" className="mt-5">
        {["All", ...myGroups].map((id) => (
          <FilterChip key={id} active={group === id} onClick={() => setGroup(id)}>
            {id === "All" ? "All groups" : groupName(id)}
          </FilterChip>
        ))}
      </ChipRow>
      <ChipRow label="Category" className="mt-2">
        {(["All", ...categories] as const).map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c === "All" ? "All categories" : c}
          </FilterChip>
        ))}
      </ChipRow>

      {!ready ? (
        <Loading block />
      ) : shown.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<PlayIcon className="h-5 w-5" />}
          title={mine.length === 0 ? "Nothing assigned yet" : "No exercises match your filters."}
          description={mine.length === 0 ? "Your coach has not assigned any exercises yet." : undefined}
        />
      ) : (
        <ul className={listClass("mt-5 max-w-3xl")} aria-label="Your exercises">
          {shown.map(({ exercise, via }) => {
            const video = hasVideo(exercise);
            return (
              <li key={exercise.id}>
                <Link
                  href={`/me/videos/${exercise.id}`}
                  aria-label={`${video ? "Watch" : "Open"} ${exercise.title}`}
                  className={`${rowLinkClass} group`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-planning-soft text-planning" aria-hidden="true">
                    {video ? <PlayIcon className="h-5 w-5" /> : <BookIcon className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{exercise.title}</span>
                    <span className="block truncate text-sm text-ink-soft">
                      {exercise.category} · {exercise.durationMin} min{video && " · Video"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-brand-strong">{via.map(viaLabel).join(" · ")}</span>
                  </span>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
