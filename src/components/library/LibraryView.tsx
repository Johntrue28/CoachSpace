"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { exerciseDisciplines } from "@/data/exercises";
import type { ExerciseDiscipline } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import ResetDemoButton from "@/components/ResetDemoButton";
import { ChevronRightIcon, PlayIcon, PlusIcon, SearchIcon } from "@/components/Icons";

export default function LibraryView() {
  const { exercises, assignments } = useDemoStore();
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<ExerciseDiscipline | "All">("All");

  const q = query.trim().toLowerCase();
  const shown = exercises.filter(
    (e) =>
      (discipline === "All" || e.discipline === discipline) &&
      (!q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)),
  );

  return (
    <main className="px-4 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Save an exercise once and reuse it across your groups.
          </p>
        </div>
        <Link
          href="/library/new"
          className="flex shrink-0 items-center gap-1 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white"
        >
          <PlusIcon className="h-4 w-4" /> New
        </Link>
      </div>

      <label className="mt-5 flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 ring-1 ring-line focus-within:ring-brand">
        <SearchIcon className="h-4 w-4 text-ink-soft" />
        <span className="sr-only">Search exercises</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises or categories"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
        />
      </label>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by discipline">
        {(["All", ...exerciseDisciplines] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDiscipline(d)}
            aria-pressed={discipline === d}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
              discipline === d ? "bg-brand text-white ring-brand" : "bg-card text-ink ring-line"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No exercises match your filters.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map((e) => {
            const groupCount = new Set(assignments.filter((a) => a.exerciseId === e.id).map((a) => a.groupId)).size;
            return (
              <li key={e.id}>
                <Link
                  href={`/library/${e.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line hover:ring-brand"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-sm text-ink-soft">
                      {e.discipline} · {e.category} · {e.durationMin} min
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
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
      )}

      <div className="mt-6 space-y-3">
        <DeviceOnlyNotice />
        <ResetDemoButton />
      </div>
    </main>
  );
}
