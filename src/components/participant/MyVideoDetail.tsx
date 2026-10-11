"use client";

import { useDemoStore } from "@/data/store";
import { exercisesForParticipant, videoSourceLabel } from "@/data/exercises";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import { PlayIcon } from "@/components/Icons";
import { viaLabel } from "./MyVideos";
import BackLink from "@/components/navigation/BackLink";
import { buttonClass } from "@/components/ui/Button";

/** An exercise as the participant sees it: no editing, instructions for each group it comes from. */
export default function MyVideoDetail({ id }: { id: string }) {
  const { exercises, assignments, ready } = useDemoStore();
  const item = exercisesForParticipant(DEMO_PARTICIPANT_ID, exercises, assignments).find((x) => x.exercise.id === id);

  return (
    <main className="px-4 pt-6">
      <BackLink fallback="/me/videos" fallbackLabel="My Videos" />

      {!item ? (
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This exercise is not assigned to you." : "Loading…"}</p>
      ) : (
        <>
          <h1 className="mt-4 text-2xl font-bold">{item.exercise.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {item.exercise.category} · {item.exercise.durationMin} min
            {item.exercise.equipment && ` · ${item.exercise.equipment}`}
          </p>
          {item.exercise.description && <p className="mt-2 text-sm">{item.exercise.description}</p>}

          {item.exercise.videoUrl && (
            <a
              href={item.exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({ size: "lg", block: true, className: "mt-4" })}
            >
              <PlayIcon className="h-5 w-5" /> Watch on {videoSourceLabel(item.exercise.videoUrl)}
            </a>
          )}

          {item.via.map((a) => (
            <section key={a.id} className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">{viaLabel(a)}</h2>
              <p className="mt-2 whitespace-pre-line text-sm">{a.customInstructions || item.exercise.instructions}</p>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
