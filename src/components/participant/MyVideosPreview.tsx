"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { exercisesForParticipant, hasVideo } from "@/data/exercises";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import { BookIcon, ChevronRightIcon, PlayIcon } from "@/components/Icons";

/** The first exercises assigned to the participant, for their home (D-052). */
export default function MyVideosPreview({ limit = 3 }: { limit?: number }) {
  const { exercises, assignments } = useDemoStore();
  const mine = exercisesForParticipant(DEMO_PARTICIPANT_ID, exercises, assignments);
  if (mine.length === 0) return <p className="text-sm text-ink-soft">Your coach has not assigned any exercises yet.</p>;
  return (
    <ul className="divide-y divide-line">
      {mine.slice(0, limit).map(({ exercise: e }) => (
        <li key={e.id}>
          <Link href={`/me/videos/${e.id}`} className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-surface">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-planning-soft text-planning">
              {hasVideo(e) ? <PlayIcon className="h-4 w-4" /> : <BookIcon className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{e.title}</span>
              <span className="block truncate text-xs text-ink-soft">
                {e.category} · {e.durationMin} min{hasVideo(e) ? " · Video" : ""}
              </span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
