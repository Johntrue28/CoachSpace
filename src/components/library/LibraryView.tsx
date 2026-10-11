"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseCategories, exerciseDisciplines } from "@/data/exercises";
import type { ExerciseCategory, ExerciseDiscipline } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import ResetDemoButton from "@/components/ResetDemoButton";
import { ChevronRightIcon, PlayIcon, PlusIcon, SearchIcon } from "@/components/Icons";
import { buttonClass } from "@/components/ui/Button";

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
      (!q || [e.title, e.description, e.category].some((text) => text.toLowerCase().includes(q))),
  );
  // Organised by category, in the usual order of a session.
  const sections = exerciseCategories
    .map((c) => ({ category: c, items: shown.filter((e) => e.category === c) }))
    .filter((s) => s.items.length > 0);

  return (
    <main className="px-4 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="mt-1 text-sm text-ink-soft">Videos & exercises: save once and reuse them across your groups.</p>
          <Link href="/library/plans" className="mt-2 inline-block text-sm font-semibold text-brand">
            Session plans and templates →
          </Link>
        </div>
        <Link
          href="/library/new"
          className={buttonClass({ size: "sm", className: "shrink-0" })}
        >
          <PlusIcon className="h-4 w-4" /> New
        </Link>
      </div>

      <div className="mt-5 flex gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-card px-3 py-2.5 ring-1 ring-line focus-within:ring-brand">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className="sr-only">Search exercises</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-soft"
          />
        </label>
        <label className="shrink-0">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory | "All")}
            className="h-full rounded-xl bg-card px-2 text-sm ring-1 ring-line outline-none focus:ring-brand"
          >
            <option value="All">All categories</option>
            {exerciseCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by discipline">
        {(["All", ...exerciseDisciplines] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDiscipline(d)}
            aria-pressed={discipline === d}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
              discipline === d ? "bg-brand text-on-brand ring-brand" : "bg-card text-ink ring-line"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {sections.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No exercises match your filters.</p>
      ) : (
        sections.map(({ category: c, items }) => (
          <section key={c} className="mt-5" aria-label={c}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {c} <span className="font-normal">({items.length})</span>
            </h2>
            <ul className="space-y-3">
              {items.map((e) => {
                const groupCount = new Set(assignments.filter((a) => a.exerciseId === e.id).map((a) => a.groupId)).size;
                return (
                  <li key={e.id}>
                    <Link
                      href={`/library/${e.id}`}
                      className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line hover:ring-brand"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{e.title}</p>
                        {e.description && <p className="truncate text-sm text-ink-soft">{e.description}</p>}
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-soft">
                          <span>
                            {e.discipline} · {e.durationMin} min
                          </span>
                          <span className={groupCount > 0 ? "font-semibold text-brand" : ""}>
                            {groupCount === 0 ? "Not assigned yet" : `Used in ${groupCount} group${groupCount > 1 ? "s" : ""}`}
                          </span>
                          {e.videoUrl && (
                            <span className="flex items-center gap-1">
                              <PlayIcon className="h-3.5 w-3.5" /> Video
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      <div className="mt-6 space-y-3">
        <DeviceOnlyNotice />
        <ResetDemoButton />
      </div>
    </main>
  );
}
