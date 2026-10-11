"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseCategories, exerciseDisciplines } from "@/data/exercises";
import type { ExerciseCategory, ExerciseDiscipline } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";
import { ArrowLeftIcon } from "@/components/Icons";

type Errors = Partial<Record<"title" | "instructions" | "duration" | "videoUrl", string>>;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function NewExerciseForm() {
  const router = useRouter();
  const { addExercise } = useDemoStore();
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState<ExerciseDiscipline>("General");
  const [category, setCategory] = useState<ExerciseCategory>("Technique");
  const [duration, setDuration] = useState("10");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const minutes = Number(duration);
    if (!title.trim()) next.title = "Give the exercise a title.";
    if (!instructions.trim()) next.instructions = "Add instructions so participants know what to do.";
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) next.duration = "Enter a duration between 1 and 180 minutes.";
    if (videoUrl.trim() && !isHttpUrl(videoUrl.trim())) next.videoUrl = "Enter a full link starting with https://";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const created = addExercise({
      title: title.trim(),
      discipline,
      category,
      durationMin: minutes,
      equipment: equipment.trim(),
      instructions: instructions.trim(),
      videoUrl: videoUrl.trim() || undefined,
    });
    router.push(`/library/${created.id}`);
  }

  return (
    <main className="px-4 pt-6">
      <Link href="/library" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
        <ArrowLeftIcon className="h-4 w-4" /> Library
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New exercise</h1>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <Field label="Title" error={errors.title}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Passing triangle" />
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
            <input
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Equipment">
            <input value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputClass} placeholder="e.g. Cones, balls" />
          </Field>
        </div>

        <Field label="Base instructions" hint="You can adapt them for each group when assigning." error={errors.instructions}>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} className={inputClass} />
        </Field>

        <Field label="Video link (optional)" hint="YouTube, Vimeo or any public link." error={errors.videoUrl}>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </Field>

        <PrimaryButton type="submit">Save to library</PrimaryButton>
        <DeviceOnlyNotice />
      </form>
    </main>
  );
}
