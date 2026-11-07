"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import type { Exercise } from "@/data/types";
import { hasVideo } from "@/data/exercises";
import { groupName } from "@/data/groups";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { BookIcon, PlayIcon, PlusIcon } from "@/components/Icons";
import VideoLink from "./VideoLink";
import { buttonClass } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { audienceLabel } from "./audience";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { categoryLabel, sportLabel, t } from "@/i18n";

/** Objective, organisation, cues and progression, when the exercise has them (demo scenarios, D-053). */
function CoachingDetails({ exercise }: { exercise: Exercise }) {
  const facts = [
    [t("exercise.objective"), exercise.objective],
    [t("exercise.setup"), exercise.setup],
    [t("exercise.groupSize"), exercise.groupSize],
  ].filter((f): f is [string, string] => Boolean(f[1]));
  const points = exercise.coachingPoints ?? [];
  if (facts.length === 0 && points.length === 0 && !exercise.progression) return null;
  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
      {facts.length > 0 && (
        <dl className="space-y-2">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="font-semibold">{label}</dt>
              <dd className="text-ink-soft">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {points.length > 0 && (
        <div>
          <h3 className="font-semibold">{t("exercise.coachingPoints")}</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-soft">
            {points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {exercise.progression && (
        <p>
          <span className="font-semibold">{t("exercise.progression")}</span> <span className="text-ink-soft">{exercise.progression}</span>
        </p>
      )}
    </div>
  );
}

export default function ExerciseDetail({ id }: { id: string }) {
  const { exercises, assignments, ready, removeAssignment } = useDemoStore();
  const [removed, setRemoved] = useState("");
  const flash = useFlashMessage();
  const exercise = exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <BackLink fallback="/library" fallbackLabel={t("back.library")} />
        <p className="mt-6 text-sm text-ink-soft">{ready ? t("exercise.notFound") : t("common.loading")}</p>
      </main>
    );
  }

  const usedIn = assignments.filter((a) => a.exerciseId === exercise.id);

  return (
    <main className="mx-auto w-full max-w-screen-xl px-4 pt-6 sm:px-6 lg:px-9">
      <BackLink fallback="/library" fallbackLabel={t("back.library")} />

      <LiveStatus message={removed || flash} className="mt-4" />

      <header className={cardClass({ padded: false, className: "mt-4 overflow-hidden" })}>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-planning-soft text-planning">
              {hasVideo(exercise) ? <PlayIcon className="h-6 w-6" /> : <BookIcon className="h-6 w-6" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-planning">{categoryLabel(exercise.category)}</p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink">{exercise.title}</h1>
              <p className="mt-1 text-sm text-ink-soft">
                {sportLabel(exercise.discipline)} · {categoryLabel(exercise.category)} · {t("common.minutes", { count: exercise.durationMin })}
              </p>
              {exercise.description && <p className="mt-2 text-sm text-ink">{exercise.description}</p>}
            </div>
          </div>
          <Link href={`/library/${exercise.id}/edit`} className={buttonClass({ variant: "secondary", size: "sm", className: "shrink-0 self-start" })}>
            {t("exercise.edit")}
          </Link>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <section className={cardClass({ className: "sm:p-5" })}>
          <h2 className="text-base font-bold text-ink">{t("exercise.baseInstructions")}</h2>
          <p className="mt-2 whitespace-pre-line text-sm">{exercise.instructions}</p>
          {exercise.equipment && (
            <p className="mt-3 text-sm">
              <span className="font-semibold">{t("exercise.equipment")}</span> <span className="text-ink-soft">{exercise.equipment}</span>
            </p>
          )}
          <CoachingDetails exercise={exercise} />
          {exercise.videoUrl && <VideoLink url={exercise.videoUrl} audience="coach" className="mt-4" />}
        </section>

        <section className={cardClass({ className: "sm:p-5" })}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">{t("exercise.usedIn")}</h2>
            <Link href={`/library/${exercise.id}/assign`} className={buttonClass({ size: "sm" })}>
              <PlusIcon className="h-4 w-4" /> {t("exercise.assign")}
            </Link>
          </div>

          {usedIn.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">{t("exercise.notAssigned")}</p>
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
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t("exercise.removeConfirm", { group: groupName(a.groupId) }))) {
                            removeAssignment(a.id);
                            setRemoved(t("exercise.removed", { group: groupName(a.groupId) }));
                          }
                        }}
                        className="inline-flex min-h-11 items-center px-1 text-danger"
                      >
                        {t("exercise.remove")}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 rounded-lg bg-surface p-2 text-sm">
                    {a.customInstructions ? (
                      <>
                        <span className="text-xs font-semibold uppercase tracking-wide text-brand-strong">{t("exercise.groupInstructions")}</span>
                        <br />
                        {a.customInstructions}
                      </>
                    ) : (
                      <span className="text-ink-soft">{t("exercise.usesBase")}</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}

