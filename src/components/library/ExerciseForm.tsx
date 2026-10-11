"use client";

import { useEffect, useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseCategories, exerciseDisciplines, videoProvider } from "@/data/exercises";
import type { ExerciseCategory, ExerciseDiscipline } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";

import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";

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
      <main className="px-4 pt-8">
        <BackLink fallback="/library" fallbackLabel="Library" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This exercise was not found." : "Loading…"}</p>
      </main>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const minutes = Number(duration);
    const link = videoUrl.trim();
    if (!title.trim()) next.title = "Give the exercise a title.";
    if (!description.trim()) next.description = "Add a short description.";
    if (!instructions.trim()) next.instructions = "Add instructions so participants know what to do.";
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) next.duration = "Enter a duration between 1 and 180 minutes.";
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
      nav.returnTo(`/library/${existing.id}`, "Changes saved on this device.");
    } else {
      const created = addExercise(data);
      nav.flash(`/library/${created.id}`, "Exercise saved to your library on this device.");
      nav.replace(`/library/${created.id}`);
    }
  }

  return (
    <main className="px-4 pt-6">
      {existing ? (
        <BackLink fallback={`/library/${existing.id}`} fallbackLabel={existing.title} />
      ) : (
        <BackLink fallback="/library" fallbackLabel="Library" />
      )}
      <h1 className="mt-4 text-2xl font-bold">{existing ? "Edit exercise" : "New exercise"}</h1>

      {!loaded ? (
        <p className="mt-6 text-sm text-ink-soft">Loading…</p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <Field label="Title" error={errors.title}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Passing triangle" />
          </Field>

          <Field label="Description" hint="One line shown in the library." error={errors.description}>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={140}
              className={inputClass}
              placeholder="e.g. Quick passing in triangles to improve first touch"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Discipline">
              <select value={discipline} onChange={(e) => setDiscipline(e.target.value as ExerciseDiscipline)} className={inputClass}>
                {exerciseDisciplines.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)} className={inputClass}>
                {exerciseCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration (min)" error={errors.duration}>
              <input inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Equipment">
              <input value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputClass} placeholder="e.g. Cones, balls" />
            </Field>
          </div>

          <Field label="Base instructions" hint="You can adapt them for each group when assigning." error={errors.instructions}>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} className={inputClass} />
          </Field>

          <Field label="Video link (optional)" hint="A YouTube or Vimeo video. Videos are never uploaded." error={errors.videoUrl}>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={inputClass}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </Field>

          <PrimaryButton type="submit">{existing ? "Save changes" : "Save to library"}</PrimaryButton>
          <DeviceOnlyNotice />
        </form>
      )}
    </main>
  );
}

