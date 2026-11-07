"use client";

import { useEffect, useState } from "react";
import { useDemoStore, type AssignmentDraft } from "@/data/store";
import { groups, participantsOf } from "@/data/groups";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";

import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Loading } from "@/components/ui/EmptyState";
import { sportLabel, t, tn } from "@/i18n";

type Mode = "none" | "group" | "selected";
type Draft = { mode: Mode; selected: string[]; custom: string };

const modes: [Mode, () => string][] = [
  ["none", () => t("assign.notAssigned")],
  ["group", () => t("assign.wholeGroup")],
  ["selected", () => t("assign.selected")],
];

const emptyDraft: Draft = { mode: "none", selected: [], custom: "" };

/**
 * The one assign flow (D-076): one exercise to several groups at once — each group gets it as a whole, only for
 * selected players, or not at all — with an optional note per group. Opened from a group's Exercises tab
 * (`focusGroupId`), that group starts chosen and saving goes back to it.
 */
export default function AssignForm({ exerciseId, focusGroupId }: { exerciseId: string; focusGroupId?: string }) {
  const nav = useNavigation();
  const { exercises, assignments, ready, replaceAssignments } = useDemoStore();
  const exercise = exercises.find((e) => e.id === exerciseId);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // Start from the current assignments once the saved data is available.
  useEffect(() => {
    if (!ready || loaded) return;
    const initial: Record<string, Draft> = {};
    for (const a of assignments.filter((x) => x.exerciseId === exerciseId)) {
      initial[a.groupId] = { mode: a.audience, selected: a.participantIds, custom: a.customInstructions };
    }
    // From a group's Exercises tab: that group starts as "Whole group" when it does not have the exercise yet.
    if (focusGroupId && !initial[focusGroupId]) initial[focusGroupId] = { ...emptyDraft, mode: "group" };
    setDrafts(initial);
    setLoaded(true);
  }, [ready, loaded, assignments, exerciseId, focusGroupId]);

  // Opened from a group's "Edit" link: bring that group into view.
  useEffect(() => {
    if (loaded && focusGroupId) document.getElementById(`group-${focusGroupId}`)?.scrollIntoView({ block: "start" });
  }, [loaded, focusGroupId]);

  if (!exercise) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <p className="text-sm text-ink-soft">{ready ? t("exercise.notFound") : t("common.loading")}</p>
      </main>
    );
  }

  const draftOf = (groupId: string) => drafts[groupId] ?? emptyDraft;
  const change = (groupId: string, patch: Partial<Draft>) => {
    setError("");
    setDrafts((prev) => ({ ...prev, [groupId]: { ...(prev[groupId] ?? emptyDraft), ...patch } }));
  };
  const toggle = (groupId: string, participantId: string) => {
    const { selected } = draftOf(groupId);
    change(groupId, {
      selected: selected.includes(participantId) ? selected.filter((x) => x !== participantId) : [...selected, participantId],
    });
  };

  const assignedGroups = groups.filter((g) => draftOf(g.id).mode !== "none");
  const individuals = assignedGroups.reduce((n, g) => n + (draftOf(g.id).mode === "selected" ? draftOf(g.id).selected.length : 0), 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = groups.find((g) => draftOf(g.id).mode === "selected" && draftOf(g.id).selected.length === 0);
    if (missing) {
      setError(t("assign.errorSelect", { group: missing.name }));
      document.getElementById(`group-${missing.id}`)?.scrollIntoView({ block: "start" });
      return;
    }
    const next: AssignmentDraft[] = assignedGroups.map((g) => {
      const d = draftOf(g.id);
      const members = participantsOf(g.id).map((p) => p.id);
      return {
        groupId: g.id,
        audience: d.mode === "selected" ? "selected" : "group",
        // Keep only participants who belong to this group.
        participantIds: d.mode === "selected" ? d.selected.filter((id) => members.includes(id)) : [],
        customInstructions: d.custom.trim(),
      };
    });
    replaceAssignments(exercise!.id, next);
    nav.returnTo(focusGroupId ? `/groups/${focusGroupId}` : `/library/${exercise!.id}`, t("assign.saved"));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback={`/library/${exercise.id}`} fallbackLabel={exercise.title} />
      <h1 className="mt-4 text-2xl font-bold">{t("assign.title")}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {t("assign.intro")}
      </p>

      {!loaded ? (
        <Loading block />
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          {groups.map((g) => {
            const d = draftOf(g.id);
            return (
              <fieldset
                key={g.id}
                id={`group-${g.id}`}
                className={`scroll-mt-4 rounded-2xl bg-card p-4 ring-1 ${d.mode === "none" ? "ring-line" : "ring-brand"}`}
              >
                <legend className="sr-only">{g.name}</legend>
                <p className="font-semibold">{g.name}</p>
                <p className="text-xs text-ink-soft">{sportLabel(g.discipline)}</p>

                <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label={t("assign.who", { group: g.name })}>
                  {modes.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => change(g.id, { mode: value })}
                      aria-pressed={d.mode === value}
                      className={`rounded-xl px-2 py-2 text-sm ring-1 ${
                        d.mode === value ? "bg-brand-soft font-semibold text-brand-strong ring-brand" : "bg-card ring-line"
                      }`}
                    >
                      {label()}
                    </button>
                  ))}
                </div>

                {d.mode === "selected" && (
                  <ul className="mt-3 divide-y divide-line rounded-xl bg-surface px-3 ring-1 ring-line">
                    {participantsOf(g.id).map((p) => (
                      <li key={p.id}>
                        <label className="flex items-center gap-3 py-2.5 text-sm">
                          <input
                            type="checkbox"
                            checked={d.selected.includes(p.id)}
                            onChange={() => toggle(g.id, p.id)}
                            className="h-4 w-4 accent-[var(--color-brand)]"
                          />
                          <span className="flex-1">{p.name}</span>
                          <span className="text-xs text-ink-soft">{p.detail}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}

                {d.mode !== "none" && (
                  <div className="mt-3">
                    <Field
                      label={t("assign.note")}
                      hint={t("assign.noteHint")}
                    >
                      <textarea
                        value={d.custom}
                        onChange={(e) => change(g.id, { custom: e.target.value })}
                        rows={3}
                        placeholder={exercise.instructions}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}
              </fieldset>
            );
          })}

          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <p className="text-center text-xs text-ink-soft" aria-live="polite">
            {assignedGroups.length === 0
              ? t("assign.none")
              : `${tn("assign.groups", assignedGroups.length)}${individuals ? tn("assign.individuals", individuals) : ""}`}
          </p>
          <PrimaryButton type="submit">{t("assign.save")}</PrimaryButton>
          <DeviceOnlyNotice />
        </form>
      )}
    </main>
  );
}
