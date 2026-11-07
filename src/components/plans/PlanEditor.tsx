"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { newId, useDemoStore } from "@/data/store";
import {
  addItem,
  itemsByBlock,
  moveItem,
  moveToBlock,
  planBlocks,
  removeItem,
  totalMinutes,
  updateItem,
  validatePlan,
  type PlanErrors,
} from "@/data/plans";
import { groups } from "@/data/groups";
import type { PlanBlock, SessionPlan } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";

import UseInSessions from "./UseInSessions";
import PreviousNotes from "@/components/notes/PreviousNotes";
import BackLink from "@/components/navigation/BackLink";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { categoryLabel, t } from "@/i18n";

const small = "grid h-8 w-8 place-items-center rounded-full text-sm ring-1 ring-line disabled:opacity-30";

/**
 * Edits a plan in the Library (D-076): its name, its group, library exercises in four blocks with order, minutes
 * and plan-specific instructions; then "Use in session" and "Duplicate". The plan is read-only in the sessions.
 */
export default function PlanEditor({ planId }: { planId: string }) {
  const router = useRouter();
  const { plans, exercises, ready, savePlan, duplicatePlan } = useDemoStore();
  const stored = plans.find((p) => p.id === planId);
  const [draft, setDraft] = useState<SessionPlan | null>(null);
  const [errors, setErrors] = useState<PlanErrors>({});
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState<Record<PlanBlock, string>>({ "warm-up": "", technical: "", tactical: "", "cool-down": "" });

  useEffect(() => {
    if (ready && stored && !draft) setDraft(stored);
  }, [ready, stored, draft]);

  if (!stored || !draft) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <BackLink fallback="/library/plans" fallbackLabel={t("back.plans")} />
        <p className="mt-6 text-sm text-ink-soft">{ready ? t("planEditor.notFound") : t("common.loading")}</p>
      </main>
    );
  }

  const now = () => new Date().toISOString();
  const change = (next: SessionPlan) => {
    setStatus("");
    setDraft(next);
  };
  const dirty = JSON.stringify({ ...draft, updatedAt: "" }) !== JSON.stringify({ ...stored, updatedAt: "" });
  const source = draft.copiedFromId ? plans.find((p) => p.id === draft.copiedFromId) : undefined;
  const exerciseById = (id: string) => exercises.find((e) => e.id === id);
  const total = totalMinutes(draft);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = validatePlan(draft!);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    savePlan({ ...draft!, title: draft!.title.trim() });
    setStatus(t("planEditor.saved"));
  }

  function addTo(block: PlanBlock) {
    const exercise = exerciseById(adding[block]);
    if (!exercise) return;
    change(addItem(draft!, exercise, newId("item"), now(), block));
    setAdding((a) => ({ ...a, [block]: "" }));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/library/plans" fallbackLabel={t("back.plans")} />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-strong">{t("planEditor.eyebrow")}</p>
      <LiveStatus message={status} className="mt-2" />

      <form onSubmit={save} className="mt-3 space-y-4" noValidate>
        <Field label={t("form.title")} error={errors.title}>
          <input value={draft.title} onChange={(e) => change({ ...draft, title: e.target.value })} className={inputClass} />
        </Field>
        <Field label={t("form.group")}>
          <select value={draft.groupId ?? ""} onChange={(e) => change({ ...draft, groupId: e.target.value || null })} className={inputClass}>
            <option value="">{t("common.anyGroup")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </Field>
        {source && (
          <p className="text-xs text-ink-soft">
            {t("planEditor.copyOf")}{" "}
            <Link href={`/library/plans/${source.id}`} className="font-semibold text-brand-strong">
              {source.title}
            </Link>
            {t("planEditor.notAffected")}
          </p>
        )}

        {draft.groupId && <PreviousNotes groupId={draft.groupId} before={null} />}

        {itemsByBlock(draft).map((block) => (
          <section key={block.id} className="rounded-2xl bg-card p-4 ring-1 ring-line" aria-label={block.label}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">{block.label}</h2>
              <span className="text-xs text-ink-soft">{block.items.reduce((n, i) => n + i.durationMin, 0)} min</span>
            </div>

            {block.items.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">{t("planEditor.noExercises")}</p>
            ) : (
              <ol className="mt-2 divide-y divide-line">
                {block.items.map((item, index) => {
                  const exercise = exerciseById(item.exerciseId);
                  return (
                    <li key={item.id} className="space-y-2 py-3">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{exercise?.title ?? t("planEditor.notFoundExercise")}</p>
                          <p className="text-xs text-ink-soft">{exercise ? categoryLabel(exercise.category) : ""}</p>
                        </div>
                        <button
                          type="button"
                          className={small}
                          disabled={index === 0}
                          onClick={() => change(moveItem(draft, item.id, -1, now()))}
                          aria-label={t("planEditor.moveUp", { name: exercise?.title ?? t("planEditor.exercise") })}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={small}
                          disabled={index === block.items.length - 1}
                          onClick={() => change(moveItem(draft, item.id, 1, now()))}
                          aria-label={t("planEditor.moveDown", { name: exercise?.title ?? t("planEditor.exercise") })}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={`${small} text-danger`}
                          onClick={() => change(removeItem(draft, item.id, now()))}
                          aria-label={t("planEditor.remove", { name: exercise?.title ?? t("planEditor.exercise") })}
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-xs font-semibold">
                          {t("planEditor.minutes")}
                          <input
                            inputMode="numeric"
                            value={Number.isNaN(item.durationMin) ? "" : String(item.durationMin)}
                            onChange={(e) => change(updateItem(draft, item.id, { durationMin: Number(e.target.value) }, now()))}
                            className={`${inputClass} mt-1 font-normal`}
                            aria-label={t("planEditor.minutesFor", { name: exercise?.title ?? t("planEditor.exercise") })}
                          />
                        </label>
                        <label className="text-xs font-semibold">
                          {t("planEditor.block")}
                          <select
                            value={item.block}
                            onChange={(e) => change(moveToBlock(draft, item.id, e.target.value as PlanBlock, now()))}
                            className={`${inputClass} mt-1 font-normal`}
                            aria-label={t("planEditor.blockFor", { name: exercise?.title ?? t("planEditor.exercise") })}
                          >
                            {planBlocks.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <textarea
                        value={item.instructions}
                        onChange={(e) => change(updateItem(draft, item.id, { instructions: e.target.value }, now()))}
                        rows={2}
                        placeholder={exercise?.instructions ?? ""}
                        className={inputClass}
                        aria-label={t("planEditor.instructionsFor", { name: exercise?.title ?? t("planEditor.exercise") })}
                      />
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-3 flex gap-2">
              <select
                value={adding[block.id]}
                onChange={(e) => setAdding((a) => ({ ...a, [block.id]: e.target.value }))}
                className={`${inputClass} min-w-0 flex-1`}
                aria-label={t("planEditor.addTo", { block: block.label })}
              >
                <option value="">{t("planEditor.addFrom")}</option>
                {exercises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({categoryLabel(e.category)}, {t("common.minutes", { count: e.durationMin })})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addTo(block.id)}
                disabled={!adding[block.id]}
                className="shrink-0 rounded-xl px-3 text-sm font-semibold text-brand-strong ring-1 ring-line disabled:opacity-40"
              >
                {t("planEditor.add")}
              </button>
            </div>
          </section>
        ))}

        <p className="text-center text-sm">
          <span className="font-bold">{t("common.minutes", { count: total })}</span>
          <span className="text-ink-soft">{t("planEditor.inTotal")}</span>
        </p>
        {errors.items && (
          <p role="alert" className="text-sm font-medium text-danger">
            {errors.items}
          </p>
        )}
        <PrimaryButton type="submit">{t("planEditor.save")}</PrimaryButton>
      </form>

      <UseInSessions plan={stored} />

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          disabled={dirty}
          onClick={() => {
            const copy = duplicatePlan(stored.id);
            if (copy) router.push(`/library/plans/${copy.id}`);
          }}
          className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-strong hover:underline disabled:opacity-40"
        >
          {t("planEditor.duplicate")}
        </button>
      </div>
      {dirty && <p className="text-center text-xs text-ink-soft">{t("planEditor.saveFirst")}</p>}

      <div className="mt-4">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}

