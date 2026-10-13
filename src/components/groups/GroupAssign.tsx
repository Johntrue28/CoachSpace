"use client";

import { useState } from "react";
import { groupById } from "@/data/groups";
import { exerciseCategories, hasVideo, wholeGroupExerciseIds } from "@/data/exercises";
import { useDemoStore } from "@/data/store";
import { Field, inputClass } from "@/components/Form";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { CheckIcon, PlayIcon, SearchIcon } from "@/components/Icons";
import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Button } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { Loading } from "@/components/ui/EmptyState";

/**
 * Group-first assignment (D-059, audit F-21): pick several library exercises for one group at once,
 * for example "this week's work for U16". Each is assigned to the whole group; exercises already
 * assigned to the whole group are shown as such. Saved in this browser only; nobody is notified.
 */
export default function GroupAssign({ groupId }: { groupId: string }) {
  const nav = useNavigation();
  const { ready, exercises, assignments, assignExercisesToGroup } = useDemoStore();
  const group = groupById(groupId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  if (!group) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
        <BackLink fallback="/groups" fallbackLabel="Groups" />
        <p className="mt-6 text-sm text-ink-soft">This group was not found in this demo.</p>
      </main>
    );
  }

  const groupHref = `/groups/${group.id}`;
  const already = wholeGroupExerciseIds(assignments, group.id);
  const q = query.trim().toLowerCase();
  const shown = exercises.filter((e) => !q || `${e.title} ${e.category} ${e.description}`.toLowerCase().includes(q));
  const byCategory = exerciseCategories
    .map((c) => ({ category: c, items: shown.filter((e) => e.category === c) }))
    .filter((c) => c.items.length > 0);

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0 || saving || !group) return;
    setSaving(true);
    assignExercisesToGroup(group.id, [...selected], instructions);
    const n = selected.size;
    nav.returnTo(
      groupHref,
      `${n} exercise${n === 1 ? "" : "s"} assigned to ${group.name}. Saved on this device; participants have not been notified (demo).`,
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <BackLink fallback={groupHref} fallbackLabel={group.name} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Assign exercises</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Choose the exercises for <span className="font-semibold text-ink">{group.name}</span>. Each one is assigned to the
        whole group and appears in its participants’ view.
      </p>

      {!ready ? (
        <Loading block />
      ) : (
        <form onSubmit={save} className="mt-5 space-y-4">
          <label className="flex items-center gap-2 rounded-control bg-card px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
            <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="sr-only">Search exercises</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises"
              className="min-h-11 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-soft sm:text-sm"
            />
          </label>

          {byCategory.length === 0 ? (
            <p className={cardClass({ className: "text-sm text-ink-soft" })}>No exercises match your search.</p>
          ) : (
            byCategory.map(({ category, items }) => (
              <fieldset key={category} className={cardClass({ padded: false, className: "overflow-hidden" })}>
                <legend className="sr-only">{category}</legend>
                <p aria-hidden="true" className="border-b border-line px-4 py-2 text-xs font-bold uppercase tracking-wide text-planning">
                  {category}
                </p>
                <ul className="divide-y divide-line">
                  {items.map((e) => {
                    const done = already.has(e.id);
                    const on = done || selected.has(e.id);
                    return (
                      <li key={e.id}>
                        <label
                          className={`flex min-h-14 items-center gap-3 px-4 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-brand ${
                            done ? "cursor-default" : "cursor-pointer hover:bg-surface"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 shrink-0 accent-[var(--color-brand-strong)]"
                            checked={on}
                            disabled={done}
                            onChange={(ev) => toggle(e.id, ev.target.checked)}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-ink">{e.title}</span>
                            <span className="block text-xs text-ink-soft">
                              {e.durationMin} min{hasVideo(e) ? " · Video" : ""}
                              {done ? " · Already assigned to the whole group" : ""}
                            </span>
                          </span>
                          {done ? (
                            <CheckIcon className="h-4 w-4 shrink-0 text-brand-strong" />
                          ) : hasVideo(e) ? (
                            <PlayIcon className="h-4 w-4 shrink-0 text-ink-soft" />
                          ) : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))
          )}

          <div className={cardClass({ className: "space-y-3" })}>
            <Field label="Instructions for the group (optional)" hint="Shown with each exercise you assign now. Leave empty to use each exercise’s own instructions.">
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} maxLength={300} className={inputClass} />
            </Field>
            <DeviceOnlyNotice>assignments are saved on this device only. Participants are not notified.</DeviceOnlyNotice>
          </div>

          <div className="sticky bottom-[calc(var(--bottom-nav-h)+0.5rem)] z-10 flex items-center gap-3 rounded-card bg-card p-3 shadow-raised ring-1 ring-line lg:bottom-4">
            <p role="status" aria-live="polite" className="min-w-0 flex-1 text-sm text-ink">
              {selected.size === 0 ? "No exercises chosen yet" : `${selected.size} exercise${selected.size === 1 ? "" : "s"} chosen`}
            </p>
            <Button type="submit" size="lg" disabled={selected.size === 0 || saving} className="shrink-0">
              {saving ? "Saving…" : "Assign to group"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
