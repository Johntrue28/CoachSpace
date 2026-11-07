"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { ChevronRightIcon, PlayIcon } from "@/components/Icons";
import { audienceLabel } from "./audience";
import { hasVideo } from "@/data/exercises";

/** "Videos & Exercises" section on a group page. */
export default function GroupAssignments({ groupId }: { groupId: string }) {
  const { assignments, exercises } = useDemoStore();
  const items = assignments
    .filter((a) => a.groupId === groupId)
    .map((a) => ({ a, exercise: exercises.find((e) => e.id === a.exerciseId) }))
    .filter((x) => x.exercise);

  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        No exercises assigned yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.map(({ a, exercise }) => (
        <li key={a.id}>
          <Link href={`/library/${exercise!.id}`} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{exercise!.title}</p>
              <p className="text-xs text-ink-soft">
                {audienceLabel(a)} · {exercise!.durationMin} min
                {a.customInstructions ? " · Group instructions" : ""}
              </p>
            </div>
            {hasVideo(exercise!) && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-ink-soft">
                <PlayIcon className="h-3.5 w-3.5" /> Video
              </span>
            )}
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
