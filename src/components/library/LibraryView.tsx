"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseCategories, exerciseDisciplines } from "@/data/exercises";
import type { Exercise, ExerciseCategory, ExerciseDiscipline } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import ResetDemoButton from "@/components/ResetDemoButton";
import { PlayIcon, PlusIcon, SearchIcon, BookIcon } from "@/components/Icons";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import LibraryTabs from "./LibraryTabs";

/**
 * Exercise library (Figma Exercise Library, D-048): search, category chips and a sport filter,
 * then the exercises as cards in session order (warm-up first) with their details and actions.
 */
export default function LibraryView() {
  const { exercises, assignments } = useDemoStore();
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<ExerciseDiscipline | "All">("All");
  const [category, setCategory] = useState<ExerciseCategory | "All">("All");

  const q = query.trim().toLowerCase();
  const shown = exercises.filter(
    (e) =>
      (discipline === "All" || e.discipline === discipline) &&
      (category === "All" || e.category === category) &&
      (!q || [e.title, e.description, e.category, e.equipment].some((text) => text.toLowerCase().includes(q))),
  );
  // In the usual order of a session: warm-up first, mobility last.
  const ordered = [...shown].sort((a, b) => exerciseCategories.indexOf(a.category) - exerciseCategories.indexOf(b.category));
  const groupsUsing = (id: string) => new Set(assignments.filter((a) => a.exerciseId === id).map((a) => a.groupId)).size;
  const filtered = Boolean(q) || discipline !== "All" || category !== "All";

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title="Exercise Library"
        description="Save exercises and videos once, then reuse and assign them across your groups."
        action={
          <ButtonLink href="/library/new">
            <PlusIcon className="h-4 w-4" /> Add exercise
          </ButtonLink>
        }
      />
      <div className="mt-5">
        <LibraryTabs current="exercises" />
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-control bg-card px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand lg:max-w-md">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className="sr-only">Search exercises</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises, equipment…"
            className="w-full min-w-0 bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          Sport
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as ExerciseDiscipline | "All")}
            className="min-h-10 rounded-control bg-card px-3 text-sm font-normal ring-1 ring-line outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="All">All sports</option>
            {exerciseDisciplines.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Category">
        {(["All", ...exerciseCategories] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`min-h-9 rounded-control px-3 text-sm font-semibold ring-1 ${
              category === c ? "bg-brand-strong text-on-brand ring-brand-strong" : "bg-card text-ink ring-line hover:ring-brand/40"
            }`}
          >
            {c === "All" ? "All categories" : c}
          </button>
        ))}
      </div>

      {ordered.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<BookIcon className="h-5 w-5" />}
          title="No exercises match your filters"
          description="Try another word, sport or category."
          action={
            filtered && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDiscipline("All");
                  setCategory("All");
                }}
                className={buttonClass({ variant: "secondary", size: "sm" })}
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <>
          <p className="mt-5 text-sm text-ink-soft" aria-live="polite">
            {shown.length} exercise{shown.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Exercises">
            {ordered.map((e) => (
              <li key={e.id}>
                <ExerciseCard exercise={e} groups={groupsUsing(e.id)} />
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8 space-y-3">
        <DeviceOnlyNotice />
        <ResetDemoButton />
      </div>
    </main>
  );
}

function ExerciseCard({ exercise: e, groups }: { exercise: Exercise; groups: number }) {
  return (
    <article className={cardClass({ padded: false, className: "flex h-full flex-col overflow-hidden" })} aria-labelledby={`ex-${e.id}`}>
      <div className="grid h-24 place-items-center bg-planning-soft text-planning">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-card">
          {e.videoUrl ? <PlayIcon className="h-5 w-5" /> : <BookIcon className="h-5 w-5" />}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold uppercase tracking-wide text-planning">{e.category}</span>
          <span className="text-ink-soft">{e.durationMin} min</span>
        </div>
        <h3 id={`ex-${e.id}`} className="mt-2 font-bold text-ink">
          <Link href={`/library/${e.id}`} className="hover:underline">
            {e.title}
          </Link>
        </h3>
        {e.description && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{e.description}</p>}
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          <span>{e.discipline}</span>
          <span className={groups > 0 ? "font-semibold text-brand-strong" : ""}>
            {groups === 0 ? "Not assigned yet" : `Used in ${groups} group${groups > 1 ? "s" : ""}`}
          </span>
          {e.videoUrl && (
            <span className="flex items-center gap-1">
              <PlayIcon className="h-3.5 w-3.5" /> Video
            </span>
          )}
        </p>
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            href={`/library/${e.id}`}
            aria-label={`View details: ${e.title}`}
            className={buttonClass({ variant: "secondary", size: "sm", className: "flex-1" })}
          >
            View details
          </Link>
          <Link
            href={`/library/${e.id}/assign`}
            aria-label={`Assign ${e.title}`}
            className={buttonClass({ variant: "ghost", size: "sm", className: "flex-1 bg-brand-soft" })}
          >
            Assign
          </Link>
        </div>
      </div>
    </article>
  );
}
