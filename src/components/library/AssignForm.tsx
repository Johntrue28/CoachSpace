"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemoStore } from "@/data/store";
import { groups, participantsOf } from "@/data/groups";
import type { Assignment } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";
import { ArrowLeftIcon } from "@/components/Icons";

export default function AssignForm({ exerciseId, editId }: { exerciseId: string; editId?: string }) {
  const router = useRouter();
  const { exercises, assignments, ready, saveAssignment } = useDemoStore();
  const exercise = exercises.find((e) => e.id === exerciseId);

  const [groupId, setGroupId] = useState("");
  const [audience, setAudience] = useState<Assignment["audience"]>("group");
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [loadedEdit, setLoadedEdit] = useState(false);

  // When editing, fill the form once the saved data is available.
  useEffect(() => {
    if (!ready || loadedEdit || !editId) return;
    const existing = assignments.find((a) => a.id === editId);
    if (existing) {
      setGroupId(existing.groupId);
      setAudience(existing.audience);
      setSelected(existing.participantIds);
      setCustom(existing.customInstructions);
    }
    setLoadedEdit(true);
  }, [ready, loadedEdit, editId, assignments]);

  if (!exercise) {
    return (
      <main className="px-4 pt-8">
        <p className="text-sm text-ink-soft">{ready ? "This exercise was not found." : "Loading…"}</p>
      </main>
    );
  }

  // An exercise is assigned at most once per group: picking a group that already has it updates that assignment.
  const existingForGroup = assignments.find((a) => a.exerciseId === exercise.id && a.groupId === groupId);
  const targetId = editId ?? existingForGroup?.id;
  const groupMembers = groupId ? participantsOf(groupId) : [];

  function chooseGroup(id: string) {
    setGroupId(id);
    setSelected([]);
    setError("");
    const existing = assignments.find((a) => a.exerciseId === exercise!.id && a.groupId === id);
    if (existing && !editId) {
      setAudience(existing.audience);
      setSelected(existing.participantIds);
      setCustom(existing.customInstructions);
    }
  }

  function toggle(id: string) {
    setError("");
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupId) return setError("Choose a group.");
    if (audience === "selected" && selected.length === 0) return setError("Select at least one participant.");
    saveAssignment({
      id: targetId,
      exerciseId: exercise!.id,
      groupId,
      audience,
      participantIds: audience === "selected" ? selected : [],
      customInstructions: custom.trim(),
      assignedOn: new Date().toISOString().slice(0, 10),
    });
    router.push(`/library/${exercise!.id}`);
  }

  return (
    <main className="px-4 pt-6">
      <Link href={`/library/${exercise.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
        <ArrowLeftIcon className="h-4 w-4" /> {exercise.title}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{editId ? "Edit assignment" : "Assign to a group"}</h1>

      <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
        <fieldset>
          <legend className="text-sm font-semibold">Group</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                disabled={Boolean(editId) && g.id !== groupId}
                onClick={() => chooseGroup(g.id)}
                aria-pressed={groupId === g.id}
                className={`rounded-xl px-3 py-2.5 text-left text-sm ring-1 disabled:opacity-40 ${
                  groupId === g.id ? "bg-brand-soft font-semibold text-brand ring-brand" : "bg-card ring-line"
                }`}
              >
                {g.name}
                <span className="block text-xs font-normal text-ink-soft">{g.discipline}</span>
              </button>
            ))}
          </div>
          {existingForGroup && !editId && (
            <p className="mt-2 text-xs text-ink-soft">
              Already assigned to this group — saving will update that assignment.
            </p>
          )}
        </fieldset>

        {groupId && (
          <fieldset>
            <legend className="text-sm font-semibold">Who should do it?</legend>
            <div className="mt-2 flex gap-2">
              {(
                [
                  ["group", "Whole group"],
                  ["selected", "Selected participants"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAudience(value);
                    setError("");
                  }}
                  aria-pressed={audience === value}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm ring-1 ${
                    audience === value ? "bg-brand-soft font-semibold text-brand ring-brand" : "bg-card ring-line"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {audience === "selected" && (
              <ul className="mt-3 divide-y divide-line rounded-xl bg-card px-3 ring-1 ring-line">
                {groupMembers.map((p) => (
                  <li key={p.id}>
                    <label className="flex items-center gap-3 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                        className="h-4 w-4 accent-[var(--color-brand)]"
                      />
                      <span className="flex-1">{p.name}</span>
                      <span className="text-xs text-ink-soft">{p.detail}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        )}

        {groupId && (
          <Field
            label="Instructions for this group (optional)"
            hint="Leave empty to use the base instructions. These replace them for this group only."
          >
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={4}
              placeholder={exercise.instructions}
              className={inputClass}
            />
          </Field>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <PrimaryButton type="submit" disabled={!groupId}>
          {targetId ? "Save changes" : "Assign exercise"}
        </PrimaryButton>
        <DeviceOnlyNotice />
      </form>
    </main>
  );
}
