"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { newId, useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { minutesBetween } from "@/data/calendar";
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
import { groupName, groups } from "@/data/groups";
import type { PlanBlock, SessionPlan } from "@/data/types";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";

import { formatDateKey } from "@/components/format";
import PreviousNotes from "@/components/notes/PreviousNotes";
import BackLink from "@/components/navigation/BackLink";
import { LiveStatus } from "@/components/ui/StatusMessage";

const small = "grid h-8 w-8 place-items-center rounded-full text-sm ring-1 ring-line disabled:opacity-30";

/**
 * Edits a session plan or template: library exercises in four blocks, with order, duration
 * and plan-specific instructions. Copies (to a template or to a group) never change this plan.
 */
export default function PlanEditor({ planId, fromSession }: { planId: string; fromSession?: boolean }) {
  const router = useRouter();
  const { plans, exercises, ready, savePlan, copyPlan } = useDemoStore();
  const { byId } = useSessions();
  const stored = plans.find((p) => p.id === planId);
  const [draft, setDraft] = useState<SessionPlan | null>(null);
  const [errors, setErrors] = useState<PlanErrors>({});
  const [status, setStatus] = useState(fromSession ? "Plan created for this session. Edit it and save." : "");
  const [adding, setAdding] = useState<Record<PlanBlock, string>>({ "warm-up": "", technical: "", tactical: "", "cool-down": "" });
  const [targetGroup, setTargetGroup] = useState(groups[0].id);

  useEffect(() => {
    if (ready && stored && !draft) setDraft(stored);
  }, [ready, stored, draft]);

  if (!stored || !draft) {
    return (
      <main className="px-4 pt-8">
        <BackLink fallback="/library/plans" fallbackLabel="Session plans" />
        <p className="mt-6 text-sm text-ink-soft">{ready ? "This plan was not found." : "Loading…"}</p>
      </main>
    );
  }

  const now = () => new Date().toISOString();
  const change = (next: SessionPlan) => {
    setStatus("");
    setDraft(next);
  };
  const dirty = JSON.stringify({ ...draft, updatedAt: "" }) !== JSON.stringify({ ...stored, updatedAt: "" });
  const session = draft.sessionId ? byId(draft.sessionId) : undefined;
  const sessionLength = session ? minutesBetween(session.time, session.endTime) : null;
  const source = draft.copiedFromId ? plans.find((p) => p.id === draft.copiedFromId) : undefined;
  const exerciseById = (id: string) => exercises.find((e) => e.id === id);
  const total = totalMinutes(draft);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = validatePlan(draft!);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    savePlan({ ...draft!, title: draft!.title.trim() });
    setStatus(draft!.kind === "template" ? "Template saved on this device." : "Plan saved on this device.");
  }

  function addTo(block: PlanBlock) {
    const exercise = exerciseById(adding[block]);
    if (!exercise) return;
    change(addItem(draft!, exercise, newId("item"), now(), block));
    setAdding((a) => ({ ...a, [block]: "" }));
  }

  return (
    <main className="px-4 pt-6">
      {session ? (
        <BackLink fallback={`/calendar/${session.id}`} fallbackLabel="Session" />
      ) : (
        <BackLink fallback="/library/plans" fallbackLabel="Session plans" />
      )}

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-strong">
        {draft.kind === "template" ? "Template" : `Plan · ${groupName(draft.groupId ?? "")}`}
      </p>
      <LiveStatus message={status} className="mt-2" />

      <form onSubmit={save} className="mt-3 space-y-4" noValidate>
        <Field label="Title" error={errors.title}>
          <input value={draft.title} onChange={(e) => change({ ...draft, title: e.target.value })} className={inputClass} />
        </Field>

        <div className="text-xs text-ink-soft">
          {session && (
            <p>
              For{" "}
              <Link href={`/calendar/${session.id}`} className="font-semibold text-brand-strong">
                {session.title} · {formatDateKey(session.date)}, {session.time}
              </Link>
            </p>
          )}
          {source && (
            <p>
              Based on{" "}
              <Link href={`/library/plans/${source.id}`} className="font-semibold text-brand-strong">
                {source.title}
              </Link>{" "}
              ({source.kind}). Changes here do not affect it.
            </p>
          )}
        </div>

        {draft.groupId && <PreviousNotes groupId={draft.groupId} before={session ?? null} />}

        {itemsByBlock(draft).map((block) => (
          <section key={block.id} className="rounded-2xl bg-card p-4 ring-1 ring-line" aria-label={block.label}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">{block.label}</h2>
              <span className="text-xs text-ink-soft">{block.items.reduce((n, i) => n + i.durationMin, 0)} min</span>
            </div>

            {block.items.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">No exercises yet.</p>
            ) : (
              <ol className="mt-2 divide-y divide-line">
                {block.items.map((item, index) => {
                  const exercise = exerciseById(item.exerciseId);
                  return (
                    <li key={item.id} className="space-y-2 py-3">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{exercise?.title ?? "Exercise not found"}</p>
                          <p className="text-xs text-ink-soft">{exercise?.category}</p>
                        </div>
                        <button
                          type="button"
                          className={small}
                          disabled={index === 0}
                          onClick={() => change(moveItem(draft, item.id, -1, now()))}
                          aria-label={`Move ${exercise?.title ?? "exercise"} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={small}
                          disabled={index === block.items.length - 1}
                          onClick={() => change(moveItem(draft, item.id, 1, now()))}
                          aria-label={`Move ${exercise?.title ?? "exercise"} down`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={`${small} text-danger`}
                          onClick={() => change(removeItem(draft, item.id, now()))}
                          aria-label={`Remove ${exercise?.title ?? "exercise"}`}
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-xs font-semibold">
                          Minutes
                          <input
                            inputMode="numeric"
                            value={Number.isNaN(item.durationMin) ? "" : String(item.durationMin)}
                            onChange={(e) => change(updateItem(draft, item.id, { durationMin: Number(e.target.value) }, now()))}
                            className={`${inputClass} mt-1 font-normal`}
                            aria-label={`Minutes for ${exercise?.title ?? "exercise"}`}
                          />
                        </label>
                        <label className="text-xs font-semibold">
                          Block
                          <select
                            value={item.block}
                            onChange={(e) => change(moveToBlock(draft, item.id, e.target.value as PlanBlock, now()))}
                            className={`${inputClass} mt-1 font-normal`}
                            aria-label={`Block for ${exercise?.title ?? "exercise"}`}
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
                        aria-label={`Instructions for ${exercise?.title ?? "exercise"} in this plan`}
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
                aria-label={`Exercise to add to ${block.label}`}
              >
                <option value="">Add from the library…</option>
                {exercises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.category}, {e.durationMin} min)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addTo(block.id)}
                disabled={!adding[block.id]}
                className="shrink-0 rounded-xl px-3 text-sm font-semibold text-brand-strong ring-1 ring-line disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </section>
        ))}

        <p className="text-center text-sm">
          <span className="font-bold">{total} min</span>
          <span className="text-ink-soft">
            {sessionLength !== null ? ` planned · the session lasts ${sessionLength} min` : " in total"}
          </span>
        </p>
        {errors.items && (
          <p role="alert" className="text-sm font-medium text-danger">
            {errors.items}
          </p>
        )}
        <PrimaryButton type="submit">{draft.kind === "template" ? "Save template" : "Save plan"}</PrimaryButton>
      </form>

      <section className="mt-6 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-line" aria-label="Reuse">
        <h2 className="font-bold">Reuse</h2>
        {dirty && <p className="text-xs text-ink-soft">Save your changes first.</p>}
        {draft.kind === "plan" ? (
          <button
            type="button"
            disabled={dirty}
            onClick={() => {
              const t = copyPlan(stored.id, { kind: "template", title: `${stored.title} (template)` });
              if (t) router.push(`/library/plans/${t.id}`);
            }}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-strong ring-1 ring-line disabled:opacity-40"
          >
            Save as a new template
          </button>
        ) : (
          <div className="flex gap-2">
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className={`${inputClass} min-w-0 flex-1`}
              aria-label="Group to adapt this template for"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={dirty}
              onClick={() => {
                const p = copyPlan(stored.id, { kind: "plan", title: `${stored.title} · ${groupName(targetGroup)}`, groupId: targetGroup });
                if (p) router.push(`/library/plans/${p.id}`);
              }}
              className="shrink-0 rounded-xl px-3 text-sm font-semibold text-brand-strong ring-1 ring-line disabled:opacity-40"
            >
              Adapt for group
            </button>
          </div>
        )}
        <p className="text-xs text-ink-soft">A copy is created. This {draft.kind} stays as it is.</p>
      </section>

      <div className="mt-4">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}

