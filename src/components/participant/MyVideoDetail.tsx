"use client";

import { useDemoStore } from "@/data/store";
import { exercisesForParticipant, hasVideo } from "@/data/exercises";
import VideoLink from "@/components/library/VideoLink";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import { BookIcon, PlayIcon } from "@/components/Icons";
import { cardClass } from "@/components/ui/Card";
import { viaLabel } from "./MyVideos";
import BackLink from "@/components/navigation/BackLink";

/** An exercise as the participant sees it: no editing, instructions for each group it comes from. */
export default function MyVideoDetail({ id }: { id: string }) {
  const { exercises, assignments, ready } = useDemoStore();
  const item = exercisesForParticipant(DEMO_PARTICIPANT_ID, exercises, assignments).find((x) => x.exercise.id === id);

  return (
    <main className="mx-auto w-full max-w-screen-xl px-4 pt-6 sm:px-6 lg:px-9">
      <BackLink fallback="/me/videos" fallbackLabel="Exercises" />

      {!item ? (
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This exercise is not assigned to you." : "Loading…"}</p>
      ) : (
        <>
          <header className={cardClass({ className: "mt-4 sm:p-6" })}>
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-planning-soft text-planning">
                {hasVideo(item.exercise) ? <PlayIcon className="h-6 w-6" /> : <BookIcon className="h-6 w-6" />}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-planning">{item.exercise.category}</p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink">{item.exercise.title}</h1>
                <p className="mt-1 text-sm text-ink-soft">
                  {item.exercise.category} · {item.exercise.durationMin} min
                  {item.exercise.equipment && ` · ${item.exercise.equipment}`}
                </p>
                {item.exercise.description && <p className="mt-2 text-sm text-ink">{item.exercise.description}</p>}
              </div>
            </div>
            {item.exercise.videoUrl && (
              <VideoLink url={item.exercise.videoUrl} audience="participant" size="lg" primary className="mt-5" />
            )}
          </header>

          {item.exercise.safetyNote && <p className="mt-4 rounded-lg bg-surface p-3 text-xs text-ink">{item.exercise.safetyNote}</p>}

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {item.via.map((a) => (
              <section key={a.id} className={cardClass({ className: "sm:p-5" })}>
                <h2 className="text-xs font-bold uppercase tracking-wide text-brand-strong">{viaLabel(a)}</h2>
                <p className="mt-2 whitespace-pre-line text-sm">{a.customInstructions || item.exercise.instructions}</p>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
