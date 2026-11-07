// Session plans and reusable templates (D-032). Pure functions, no React.
// Plans reference library exercises by id; the exercise model is not duplicated.

import type { Exercise, ExerciseCategory, PlanBlock, PlanItem, SessionPlan } from "./types";

/** The four blocks of a plan, in order. */
export const planBlocks: { id: PlanBlock; label: string }[] = [
  { id: "warm-up", label: "Warm-up" },
  { id: "technical", label: "Technical" },
  { id: "tactical", label: "Tactical" },
  { id: "cool-down", label: "Cool-down" },
];

/** The block an exercise usually goes in, from its library category. */
export function defaultBlockFor(category: ExerciseCategory): PlanBlock {
  if (category === "Warm-up") return "warm-up";
  if (category === "Tactics") return "tactical";
  if (category === "Mobility") return "cool-down";
  return "technical";
}

type NewPlan = Pick<SessionPlan, "kind" | "title"> & Partial<Pick<SessionPlan, "groupId" | "sessionId">>;

export function newPlan(input: NewPlan, id: string, now: string): SessionPlan {
  return {
    id,
    kind: input.kind,
    title: input.title,
    groupId: input.kind === "template" ? null : (input.groupId ?? null),
    sessionId: input.kind === "template" ? null : (input.sessionId ?? null),
    copiedFromId: null,
    items: [],
    updatedAt: now,
  };
}

/**
 * Copies a template or plan into a new one (a template, or a plan for a group/session).
 * The source is not modified: items are new objects with new ids.
 */
export function copyPlan(
  source: SessionPlan,
  target: NewPlan,
  ids: { plan: string; item: () => string },
  now: string,
): SessionPlan {
  return {
    ...newPlan(target, ids.plan, now),
    copiedFromId: source.id,
    items: source.items.map((item) => ({ ...item, id: ids.item() })),
  };
}

const touch = (plan: SessionPlan, items: PlanItem[], now: string): SessionPlan => ({ ...plan, items, updatedAt: now });

export function addItem(plan: SessionPlan, exercise: Exercise, itemId: string, now: string, block?: PlanBlock) {
  const item: PlanItem = {
    id: itemId,
    exerciseId: exercise.id,
    block: block ?? defaultBlockFor(exercise.category),
    durationMin: exercise.durationMin,
    instructions: "",
  };
  return touch(plan, [...plan.items, item], now);
}

export function removeItem(plan: SessionPlan, itemId: string, now: string) {
  return touch(plan, plan.items.filter((i) => i.id !== itemId), now);
}

export function updateItem(
  plan: SessionPlan,
  itemId: string,
  patch: Partial<Pick<PlanItem, "durationMin" | "instructions">>,
  now: string,
) {
  return touch(plan, plan.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)), now);
}

/** Moves an item to another block (at the end of it). */
export function moveToBlock(plan: SessionPlan, itemId: string, block: PlanBlock, now: string) {
  const item = plan.items.find((i) => i.id === itemId);
  if (!item || item.block === block) return plan;
  return touch(plan, [...plan.items.filter((i) => i.id !== itemId), { ...item, block }], now);
}

/** Moves an item one place up (-1) or down (+1) within its block. */
export function moveItem(plan: SessionPlan, itemId: string, direction: -1 | 1, now: string) {
  const index = plan.items.findIndex((i) => i.id === itemId);
  if (index < 0) return plan;
  const block = plan.items[index].block;
  let other = index + direction;
  while (other >= 0 && other < plan.items.length && plan.items[other].block !== block) other += direction;
  if (other < 0 || other >= plan.items.length) return plan;
  const items = [...plan.items];
  [items[index], items[other]] = [items[other], items[index]];
  return touch(plan, items, now);
}

/** The plan's items grouped by block, in session order. */
export function itemsByBlock(plan: SessionPlan) {
  return planBlocks.map((b) => ({ ...b, items: plan.items.filter((i) => i.block === b.id) }));
}

export function totalMinutes(plan: SessionPlan) {
  return plan.items.reduce((n, i) => n + i.durationMin, 0);
}

export type PlanErrors = { title?: string; items?: string };

export function validatePlan(plan: SessionPlan): PlanErrors {
  const errors: PlanErrors = {};
  if (!plan.title.trim()) errors.title = "Give the plan a title.";
  if (plan.items.some((i) => !Number.isInteger(i.durationMin) || i.durationMin < 1 || i.durationMin > 120)) {
    errors.items = "Each exercise needs a duration between 1 and 120 minutes.";
  }
  return errors;
}

/** Adds or replaces a plan in a list. */
export function upsertPlan(plans: SessionPlan[], plan: SessionPlan) {
  return plans.some((p) => p.id === plan.id) ? plans.map((p) => (p.id === plan.id ? plan : p)) : [...plans, plan];
}

export function templatesOf(plans: SessionPlan[]) {
  return plans.filter((p) => p.kind === "template");
}

export function plansForGroup(plans: SessionPlan[], groupId: string) {
  return plans.filter((p) => p.kind === "plan" && p.groupId === groupId);
}

export function planForSession(plans: SessionPlan[], sessionId: string) {
  return plans.find((p) => p.kind === "plan" && p.sessionId === sessionId);
}

/**
 * A read-only outline of a plan for participants (D-058): the blocks that have exercises, each
 * exercise with its minutes and the instructions for this plan (or the exercise's short
 * description when the plan adds none). Exercises missing from the library are left out.
 */
export function planOutline(plan: SessionPlan, exercises: Pick<Exercise, "id" | "title" | "description">[]) {
  return itemsByBlock(plan)
    .map((b) => ({
      id: b.id,
      label: b.label,
      items: b.items.flatMap((i) => {
        const e = exercises.find((x) => x.id === i.exerciseId);
        return e ? [{ id: i.id, exerciseId: e.id, title: e.title, minutes: i.durationMin, text: i.instructions.trim() || e.description }] : [];
      }),
    }))
    .filter((b) => b.items.length > 0);
}
