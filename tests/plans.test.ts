// Session builder: plans, templates and copies.
import "./fixtures/use-harbour"; // the original mixed-sport data these rules were written against
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { seedExercises } from "@/data/exercises";
import { seedPlans } from "@/data/coaching";
import {
  addItem,
  copyPlan,
  itemsByBlock,
  moveItem,
  moveToBlock,
  newPlan,
  planForSession,
  removeItem,
  totalMinutes,
  updateItem,
  upsertPlan,
  validatePlan,
} from "@/data/plans";

const NOW = "2026-10-11T10:00:00Z";
const ex = (id: string) => seedExercises.find((e) => e.id === id)!;
let n = 0;
const ids = () => ({ plan: `plan-${++n}`, item: () => `item-${++n}` });

describe("building a plan", () => {
  test("adds library exercises to the block that fits their category", () => {
    let plan = newPlan({ kind: "template", title: "Test" }, "p1", NOW);
    plan = addItem(plan, ex("e1"), "i1", NOW); // Warm-up
    plan = addItem(plan, ex("e3"), "i2", NOW); // Tactics
    plan = addItem(plan, ex("e9"), "i3", NOW); // Mobility
    plan = addItem(plan, ex("e2"), "i4", NOW); // Technique
    assert.deepEqual(itemsByBlock(plan).map((b) => b.items.map((i) => i.exerciseId)), [["e1"], ["e2"], ["e3"], ["e9"]]);
    assert.equal(totalMinutes(plan), 10 + 15 + 8 + 12);
    assert.equal(plan.items[0].durationMin, ex("e1").durationMin);
  });
  test("orders, moves between blocks, edits and removes items", () => {
    let plan = newPlan({ kind: "template", title: "Test" }, "p1", NOW);
    plan = addItem(plan, ex("e2"), "a", NOW);
    plan = addItem(plan, ex("e4"), "b", NOW);
    plan = addItem(plan, ex("e1"), "w", NOW);
    plan = moveItem(plan, "b", -1, NOW);
    assert.deepEqual(itemsByBlock(plan)[1].items.map((i) => i.id), ["b", "a"]);
    assert.equal(moveItem(plan, "b", -1, NOW), plan, "first item of a block cannot move up");
    plan = moveToBlock(plan, "a", "tactical", NOW);
    assert.deepEqual(itemsByBlock(plan)[2].items.map((i) => i.id), ["a"]);
    plan = updateItem(plan, "b", { durationMin: 20, instructions: "Left hand only" }, NOW);
    assert.deepEqual([plan.items.find((i) => i.id === "b")?.durationMin, plan.items.find((i) => i.id === "b")?.instructions], [20, "Left hand only"]);
    plan = removeItem(plan, "w", NOW);
    assert.equal(plan.items.length, 2);
  });
  test("validates the title and durations", () => {
    const plan = { ...newPlan({ kind: "template", title: " " }, "p1", NOW) };
    assert.ok(validatePlan(plan).title);
    const bad = updateItem(addItem({ ...plan, title: "x" }, ex("e1"), "i", NOW), "i", { durationMin: 0 }, NOW);
    assert.ok(validatePlan(bad).items);
  });
  test("a template never has a group or session", () => {
    const t = newPlan({ kind: "template", title: "T", groupId: "g1", sessionId: "g1-2026-10-12" }, "t", NOW);
    assert.deepEqual([t.groupId, t.sessionId], [null, null]);
  });
});

describe("templates and copies", () => {
  const template = seedPlans[0];
  const snapshot = structuredClone(template);

  test("a plan created from a template copies its exercises for a group and session", () => {
    const plan = copyPlan(template, { kind: "plan", title: "U12 Monday", groupId: "g1", sessionId: "g1-2026-10-12" }, ids(), NOW);
    assert.deepEqual([plan.kind, plan.groupId, plan.sessionId, plan.copiedFromId], ["plan", "g1", "g1-2026-10-12", template.id]);
    assert.deepEqual(plan.items.map((i) => [i.exerciseId, i.block, i.durationMin]), template.items.map((i) => [i.exerciseId, i.block, i.durationMin]));
    assert.ok(plan.items.every((i, k) => i.id !== template.items[k].id), "items get new ids");
  });
  test("adapting the copy never changes the original template", () => {
    let plan = copyPlan(template, { kind: "plan", title: "Adapted", groupId: "g1" }, ids(), NOW);
    plan = updateItem(plan, plan.items[0].id, { durationMin: 5, instructions: "Shorter for U12" }, NOW);
    plan = removeItem(plan, plan.items[1].id, NOW);
    plan = addItem(plan, ex("e7"), "extra", NOW);
    const list = upsertPlan(seedPlans, plan);
    assert.deepEqual(template, snapshot);
    assert.deepEqual(list.find((p) => p.id === template.id), snapshot);
  });
  test("a plan can be saved as a new template", () => {
    const plan = copyPlan(template, { kind: "plan", title: "Adapted", groupId: "g1" }, ids(), NOW);
    const t = copyPlan(plan, { kind: "template", title: "My template" }, ids(), NOW);
    assert.deepEqual([t.kind, t.groupId, t.copiedFromId], ["template", null, plan.id]);
  });
  test("finds the plan of a session", () => {
    const plan = copyPlan(template, { kind: "plan", title: "x", groupId: "g1", sessionId: "s1" }, ids(), NOW);
    assert.equal(planForSession(upsertPlan(seedPlans, plan), "s1")?.id, plan.id);
    assert.equal(planForSession(seedPlans, "s1"), undefined);
  });
});
