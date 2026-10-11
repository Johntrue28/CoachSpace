"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { exercisesForParticipant } from "@/data/exercises";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import { ChevronRightIcon } from "@/components/Icons";

/** The participant's exercises that come from one group. */
export default function MyGroupExercises({ groupId }: { groupId: string }) {
  const { exercises, assignments } = useDemoStore();
  const items = exercisesForParticipant(DEMO_PARTICIPANT_ID, exercises, assignments).filter(({ via }) =>
    via.some((a) => a.groupId === groupId),
  );
  if (items.length === 0) return <p className="text-sm text-ink-soft">No exercises from this group yet.</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map(({ exercise }) => (
        <li key={exercise.id}>
          <Link href={`/me/videos/${exercise.id}`} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{exercise.title}</p>
              <p className="text-xs text-ink-soft">
                {exercise.category} · {exercise.durationMin} min
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
