"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { videoSourceLabel } from "@/data/exercises";
import { groupName } from "@/data/groups";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { PlayIcon, PlusIcon } from "@/components/Icons";
import { audienceLabel } from "./audience";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";
import { LiveStatus } from "@/components/ui/StatusMessage";

export default function ExerciseDetail({ id }: { id: string }) {
  const { exercises, assignments, ready, removeAssignment } = useDemoStore();
  const [removed, setRemoved] = useState("");
  const flash = useFlashMessage();
  const exercise = exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <main className="px-4 pt-8">
        <BackLink fallback="/library" fallbackLabel="Library" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This exercise was not found." : "Loading…"}</p>
      </main>
    );
  }

  const usedIn = assignments.filter((a) => a.exerciseId === exercise.id);

  return (
    <main className="px-4 pt-6">
      <BackLink fallback="/library" fallbackLabel="Library" />

      <LiveStatus message={removed || flash} className="mt-4" />

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{exercise.title}</h1>
        <Link href={`/library/${exercise.id}/edit`} className="shrink-0 pt-1 text-sm font-semibold text-brand-strong">
          Edit
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        {exercise.discipline} · {exercise.category} · {exercise.durationMin} min
      </p>
      {exercise.description && <p className="mt-2 text-sm">{exercise.description}</p>}

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
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong"
          >
            <PlayIcon className="h-4 w-4" /> Watch on {videoSourceLabel(exercise.videoUrl)} (opens in a new tab)
          </a>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Used in</h2>
          <Link
            href={`/library/${exercise.id}/assign`}
            className="flex items-center gap-1 text-sm font-semibold text-brand-strong"
          >
            <PlusIcon className="h-4 w-4" /> Assign
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
                    <Link href={`/library/${exercise.id}/assign?group=${a.groupId}`} className="text-brand-strong">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove this exercise from ${groupName(a.groupId)}?`)) {
                          removeAssignment(a.id);
                          setRemoved(`Removed from ${groupName(a.groupId)}.`);
                        }
                      }}
                      className="text-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="mt-2 rounded-lg bg-surface p-2 text-sm">
                  {a.customInstructions ? (
                    <>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-strong">Group instructions</span>
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

