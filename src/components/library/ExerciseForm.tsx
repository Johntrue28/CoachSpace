"use client";

import { useEffect, useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseCategories, exerciseDisciplines, videoProvider } from "@/data/exercises";
import type { ExerciseCategory, ExerciseDiscipline } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";

import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Loading } from "@/components/ui/EmptyState";
import { categoryLabel, sportLabel, t } from "@/i18n";

type Errors = Partial<Record<"title" | "description" | "instructions" | "duration" | "videoUrl", string>>;

/** Creates an exercise, or edits one when `exerciseId` is given. */
export default function ExerciseForm({ exerciseId }: { exerciseId?: string }) {
  const nav = useNavigation();
  const { exercises, ready, addExercise, updateExercise } = useDemoStore();
  const existing = exerciseId ? exercises.find((e) => e.id === exerciseId) : undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState<ExerciseDiscipline>("General");
  const [category, setCategory] = useState<ExerciseCategory>("Technique");
  const [duration, setDuration] = useState("10");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loaded, setLoaded] = useState(!exerciseId);

  // When editing, fill the form once the saved data is available.
  useEffect(() => {
    if (loaded || !ready || !existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setDiscipline(existing.discipline);
    setCategory(existing.category);
    setDuration(String(existing.durationMin));
    setEquipment(existing.equipment);
    setInstructions(existing.instructions);
    setVideoUrl(existing.videoUrl ?? "");
    setLoaded(true);
  }, [loaded, ready, existing]);

  if (exerciseId && !existing) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <BackLink fallback="/library" fallbackLabel={t("back.library")} />
        <p className="mt-6 text-sm text-ink-soft">{ready ? t("exercise.notFound") : t("common.loading")}</p>
      </main>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const minutes = Number(duration);
    const link = videoUrl.trim();
    if (!title.trim()) next.title = t("exerciseForm.errorTitle");
    if (!description.trim()) next.description = t("exerciseForm.errorDescription");
    if (!instructions.trim()) next.instructions = t("exerciseForm.errorInstructions");
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) next.duration = t("exerciseForm.errorDuration");
    // Links already saved in the demo data are kept; new or changed links must be YouTube or Vimeo videos.
    if (link && link !== existing?.videoUrl && !videoProvider(link)) {
      next.videoUrl = "Use a YouTube or Vimeo video link, e.g. https://www.youtube.com/watch?v=… or https://vimeo.com/123456789";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const data = {
      title: title.trim(),
      description: description.trim(),
      discipline,
      category,
      durationMin: minutes,
      equipment: equipment.trim(),
      instructions: instructions.trim(),
      videoUrl: link || undefined,
    };
    if (existing) {
      updateExercise(existing.id, data);
      nav.returnTo(`/library/${existing.id}`, t("exerciseForm.saved"));
    } else {
      const created = addExercise(data);
      nav.flash(`/library/${created.id}`, t("exerciseForm.created"));
      nav.replace(`/library/${created.id}`);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      {existing ? (
        <BackLink fallback={`/library/${existing.id}`} fallbackLabel={existing.title} />
      ) : (
        <BackLink fallback="/library" fallbackLabel={t("back.library")} />
      )}
      <h1 className="mt-4 text-2xl font-bold">{existing ? t("exerciseForm.editTitle") : t("exerciseForm.newTitle")}</h1>

      {!loaded ? (
        <Loading className="mt-6" />
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <Field label={t("exerciseForm.title")} error={errors.title}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Passing triangle" />
          </Field>

          <Field label={t("exerciseForm.description")} hint={t("exerciseForm.descriptionHint")} error={errors.description}>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={140}
              className={inputClass}
              placeholder={t("exerciseForm.descriptionPlaceholder")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("exerciseForm.discipline")}>
              <select value={discipline} onChange={(e) => setDiscipline(e.target.value as ExerciseDiscipline)} className={inputClass}>
                {exerciseDisciplines.map((d) => (
                  <option key={d} value={d}>
                    {sportLabel(d)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("exerciseForm.category")}>
              <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)} className={inputClass}>
                {exerciseCategories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("exerciseForm.duration")} error={errors.duration}>
              <input inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("exerciseForm.equipment")}>
              <input value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputClass} placeholder="e.g. Cones, balls" />
            </Field>
          </div>

          <Field label={t("exerciseForm.instructions")} hint={t("exerciseForm.instructionsHint")} error={errors.instructions}>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} className={inputClass} />
          </Field>

          <Field label={t("exerciseForm.video")} hint={t("exerciseForm.videoHint")} error={errors.videoUrl}>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={inputClass}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </Field>

          <PrimaryButton type="submit">{existing ? t("exerciseForm.save") : t("exerciseForm.create")}</PrimaryButton>
          <DeviceOnlyNotice />
        </form>
      )}
    </main>
  );
}

