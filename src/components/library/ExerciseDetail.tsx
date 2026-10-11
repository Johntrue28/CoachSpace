"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { groupName } from "@/data/groups";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { ArrowLeftIcon, PlayIcon, PlusIcon } from "@/components/Icons";
import { audienceLabel } from "./audience";

export default function ExerciseDetail({ id }: { id: string }) {
  const { exercises, assignments, ready, removeAssignment } = useDemoStore();
  const exercise = exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <main className="px-4 pt-8">
        <BackLink />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This exercise was not found." : "Loading…"}</p>
      </main>
    );
  }

  const usedIn = assignments.filter((a) => a.exerciseId === exercise.id);

  return (
    <main className="px-4 pt-6">
      <BackLink />

      <h1 className="mt-4 text-2xl font-bold">{exercise.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {exercise.discipline} · {exercise.category} · {exercise.durationMin} min
      </p>

      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <h2 className="font-bold">Base instructions</h2>
        <p className="mt-2 whitespace-pre-line text-sm">{exercise.instructions}</p>
        {exercise.equipment && (
          <p className="mt-3 text-sm">
            <span className="font-semibold">Equipment:</span> <span className="text-ink-soft">{exercise.equipment}</span>
          </p>
        )}
        {exercise.videoUrl && (
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <PlayIcon className="h-4 w-4" /> Watch video (opens in a new tab)
          </a>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Used in</h2>
          <Link
            href={`/library/${exercise.id}/assign`}
            className="flex items-center gap-1 text-sm font-semibold text-brand"
          >
            <PlusIcon className="h-4 w-4" /> Assign to a group
          </Link>
        </div>

        {usedIn.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Not assigned to any group yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {usedIn.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/groups/${a.groupId}`} className="font-semibold hover:underline">
                      {groupName(a.groupId)}
                    </Link>
                    <p className="text-xs text-ink-soft">{audienceLabel(a)}</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm font-semibold">
                    <Link href={`/library/${exercise.id}/assign?edit=${a.id}`} className="text-brand">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove this exercise from ${groupName(a.groupId)}?`)) removeAssignment(a.id);
                      }}
                      className="text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="mt-2 rounded-lg bg-surface p-2 text-sm">
                  {a.customInstructions ? (
                    <>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand">Group instructions</span>
                      <br />
                      {a.customInstructions}
                    </>
                  ) : (
                    <span className="text-ink-soft">Uses the base instructions.</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-4">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link href="/library" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
      <ArrowLeftIcon className="h-4 w-4" /> Library
    </Link>
  );
}
