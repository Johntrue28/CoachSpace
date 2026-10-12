"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseCategories, exercisesForParticipant } from "@/data/exercises";
import { DEMO_PARTICIPANT_ID, groupIdsOf, groupName } from "@/data/groups";
import type { Assignment, ExerciseCategory } from "@/data/types";
import { BookIcon, PlayIcon } from "@/components/Icons";
import { buttonClass } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import EmptyState, { Loading } from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";

/** How an assignment reaches the participant: "Morning Pilates" or "Senior Basketball · just for you". */
export function viaLabel(a: Assignment) {
  return a.audience === "selected" ? `${groupName(a.groupId)} · just for you` : groupName(a.groupId);
}

/**
 * "My Videos" (Figma participant My Videos, D-052): every exercise assigned to the demo participant
 * across all their groups, each shown once even when several assignments make it visible.
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

  const chip = (active: boolean) =>
    `min-h-9 rounded-control px-3 text-sm font-semibold ring-1 ${
      active ? "bg-brand-strong text-on-brand ring-brand-strong" : "bg-card text-ink ring-line hover:ring-brand/40"
    }`;

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader title="My Videos" description="Exercises and training videos from your coach, for all your groups." />

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by group">
        {["All", ...myGroups].map((id) => (
          <button key={id} type="button" onClick={() => setGroup(id)} aria-pressed={group === id} className={chip(group === id)}>
            {id === "All" ? "All groups" : groupName(id)}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Category">
        {(["All", ...exerciseCategories] as const).map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={chip(category === c)}>
            {c === "All" ? "All categories" : c}
          </button>
        ))}
      </div>

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
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ exercise, via }) => (
            <li key={exercise.id}>
              <article className={cardClass({ padded: false, className: "flex h-full flex-col overflow-hidden" })}>
                <div className="grid h-20 place-items-center bg-planning-soft text-planning sm:h-28">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-card shadow-card">
                    {exercise.videoUrl ? <PlayIcon className="h-5 w-5" /> : <BookIcon className="h-5 w-5" />}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wide text-planning">{exercise.category}</span>
                    <span className="text-ink-soft">{exercise.durationMin} min</span>
                  </div>
                  <p className="mt-2 font-semibold text-ink">{exercise.title}</p>
                  {exercise.description && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{exercise.description}</p>}
                  <p className="mt-3 flex flex-wrap gap-1">
                    {via.map((a) => (
                      <span key={a.id} className="rounded-full bg-brand-soft px-2 py-0.5 text-label font-semibold text-brand-strong">
                        {viaLabel(a)}
                      </span>
                    ))}
                  </p>
                  <div className="mt-auto pt-4">
                    <Link href={`/me/videos/${exercise.id}`} aria-label={`Open ${exercise.title}`} className={buttonClass({ size: "sm", block: true })}>
                      {exercise.videoUrl ? "Watch video" : "Open exercise"}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
