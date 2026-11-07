"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { hasVideo } from "@/data/exercises";
import { groupName } from "@/data/groups";
import { filterExercises, groupsUsing, usageLabel, usedCategories } from "@/data/library";
import type { Exercise, ExerciseCategory } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { BookIcon, ChevronRightIcon, PlayIcon, PlusIcon, SearchIcon } from "@/components/Icons";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { listClass, rowLinkClass } from "@/components/ui/Card";
import { ChipRow, FilterChip } from "@/components/ui/FilterChip";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import LibraryTabs from "./LibraryTabs";
import { categoryLabel, t, tn } from "@/i18n";

/**
 * Exercise library (Figma Exercise Library, D-048): search and one row of category chips, then the exercises as
 * rows of one list in session order (R8: fewer boxes). Each row opens the exercise, where it is assigned. Opened
 * from a group's Exercises tab (`assignTo`), a row goes straight to the one assign flow with that group chosen (D-076).
 */
export default function LibraryView({ assignTo }: { assignTo?: string }) {
  const { exercises, assignments } = useDemoStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "All">("All");

  // In the usual order of a session: warm-up first, mobility last.
  const ordered = filterExercises(exercises, { query, category });
  const filtered = Boolean(query.trim()) || category !== "All";
  const categories = usedCategories(exercises, category);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title={t("library.title")}
        description={t("library.description")}
        action={
          <ButtonLink href="/library/new">
            <PlusIcon className="h-4 w-4" /> {t("library.addExercise")}
          </ButtonLink>
        }
      />
      <div className="mt-5">
        <LibraryTabs current="exercises" />
      </div>
      {assignTo && (
        <p role="status" className="mt-4 flex flex-wrap items-center gap-x-2 rounded-card bg-brand-soft px-4 py-3 text-sm text-ink">
          <span className="font-semibold">{t("library.chooseFor", { group: groupName(assignTo) })}</span>
          <Link href={`/groups/${assignTo}`} className="inline-flex min-h-11 items-center font-semibold text-brand-strong hover:underline">
            {t("common.cancel")}
          </Link>
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-control bg-card px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand lg:max-w-md">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className="sr-only">{t("library.search")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("library.searchPlaceholder")}
            className="w-full min-w-0 bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft"
          />
        </label>
      </div>
      <ChipRow label={t("library.category")} className="mt-3">
        {(["All", ...categories] as const).map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c === "All" ? t("library.allCategories") : categoryLabel(c)}
          </FilterChip>
        ))}
      </ChipRow>

      {ordered.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<BookIcon className="h-5 w-5" />}
          title={t("library.noMatch")}
          description={t("library.noMatchHint")}
          action={
            filtered && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className={buttonClass({ variant: "secondary", size: "sm" })}
              >
                {t("library.clearFilters")}
              </button>
            )
          }
        />
      ) : (
        <>
          <p className="mt-5 text-sm text-ink-soft" aria-live="polite">
            {tn("library.count", ordered.length)}
          </p>
          <ul className={listClass("mt-2 max-w-4xl")} aria-label={t("library.list")}>
            {ordered.map((e) => (
              <li key={e.id}>
                <ExerciseRow exercise={e} groups={groupsUsing(assignments, e.id)} href={assignTo ? `/library/${e.id}/assign?group=${assignTo}` : undefined} />
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}

/** One exercise as a list row: kind (video or exercise), title, category, length, sport and how widely it is used. */
export function ExerciseRow({ exercise: e, groups, href }: { exercise: Exercise; groups?: number; href?: string }) {
  const video = hasVideo(e);
  return (
    <Link href={href ?? `/library/${e.id}`} className={`${rowLinkClass} group`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-planning-soft text-planning" aria-hidden="true">
        {video ? <PlayIcon className="h-5 w-5" /> : <BookIcon className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{e.title}</span>
        <span className="block truncate text-sm text-ink-soft">
          {categoryLabel(e.category)} · {t("common.minutes", { count: e.durationMin })}{e.discipline === "General" ? t("library.rowGeneral") : ""}
          {video && t("library.rowVideo")}
        </span>
        {groups !== undefined && (
          <span className={`mt-0.5 block text-xs ${groups > 0 ? "font-semibold text-brand-strong" : "text-ink-soft"}`}>{usageLabel(groups)}</span>
        )}
      </span>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
    </Link>
  );
}
