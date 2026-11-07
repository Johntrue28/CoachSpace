// Plans (D-032, D-076): building a plan, duplicating it and using it in sessions.
import "./fixtures/use-harbour"; // the original mixed-sport data these rules were written against
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { seedExercises } from "@/data/exercises";
import { seedPlans } from "@/data/coaching";
import {
  addItem,
  duplicatePlan,
  migrateSavedPlans,
  setPlanSessions,
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
    let plan = newPlan({ title: "Test" }, "p1", NOW);
    plan = addItem(plan, ex("e1"), "i1", NOW); // Warm-up
    plan = addItem(plan, ex("e3"), "i2", NOW); // Tactics
    plan = addItem(plan, ex("e9"), "i3", NOW); // Mobility
    plan = addItem(plan, ex("e2"), "i4", NOW); // Technique
    assert.deepEqual(itemsByBlock(plan).map((b) => b.items.map((i) => i.exerciseId)), [["e1"], ["e2"], ["e3"], ["e9"]]);
    assert.equal(totalMinutes(plan), 10 + 15 + 8 + 12);
    assert.equal(plan.items[0].durationMin, ex("e1").durationMin);
  });
  test("orders, moves between blocks, edits and removes items", () => {
    let plan = newPlan({ title: "Test" }, "p1", NOW);
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
    const plan = { ...newPlan({ title: " " }, "p1", NOW) };
    assert.ok(validatePlan(plan).title);
    const bad = updateItem(addItem({ ...plan, title: "x" }, ex("e1"), "i", NOW), "i", { durationMin: 0 }, NOW);
    assert.ok(validatePlan(bad).items);
  });
  test("a new plan has no sessions yet", () => {
    const p = newPlan({ title: "T", groupId: "g1" }, "t", NOW);
    assert.deepEqual([p.groupId, p.sessionIds, p.items], ["g1", [], []]);
  });
});

describe("duplicating and using plans", () => {
  const source = { ...seedPlans[0], groupId: "g1", sessionIds: ["s1"] };
  const snapshot = structuredClone(source);

  test("Duplicate copies the exercises with new ids, the group, and no sessions", () => {
    const copy = duplicatePlan(source, ids(), NOW);
    assert.deepEqual([copy.title, copy.groupId, copy.sessionIds, copy.copiedFromId], [`${source.title} (copy)`, "g1", [], source.id]);
    assert.deepEqual(copy.items.map((i) => [i.exerciseId, i.block, i.durationMin]), source.items.map((i) => [i.exerciseId, i.block, i.durationMin]));
    assert.ok(copy.items.every((i, k) => i.id !== source.items[k].id), "items get new ids");
  });
  test("adapting the copy never changes the original", () => {
    let copy = duplicatePlan(source, ids(), NOW);
    copy = updateItem(copy, copy.items[0].id, { durationMin: 5, instructions: "Shorter for U12" }, NOW);
    copy = removeItem(copy, copy.items[1].id, NOW);
    upsertPlan([source], copy);
    assert.deepEqual(source, snapshot);
  });
  test("Use in session: a plan in several sessions, a session in one plan at most", () => {
    const a = { ...newPlan({ title: "A" }, "a", NOW), sessionIds: ["s1", "s2"] };
    const b = { ...newPlan({ title: "B" }, "b", NOW), sessionIds: ["s3"] };
    const next = setPlanSessions([a, b], "b", ["s2", "s3", "s3", "s4"]);
    assert.deepEqual(next.map((p) => p.sessionIds), [["s1"], ["s2", "s3", "s4"]]);
    assert.equal(planForSession(next, "s2")?.id, "b");
    assert.equal(planForSession(next, "s1")?.id, "a");
    assert.equal(planForSession(next, "s9"), undefined);
    assert.deepEqual(setPlanSessions(next, "b", []).map((p) => p.sessionIds), [["s1"], []]);
  });
  test("plans saved before D-076 are read as plans used in their one session", () => {
    const old = [
      { id: "t", kind: "template", title: "T", groupId: null, sessionId: null, copiedFromId: null, items: [], updatedAt: NOW },
      { id: "p", kind: "plan", title: "P", groupId: "g1", sessionId: "s1", copiedFromId: "t", items: [], updatedAt: NOW },
    ];
    assert.deepEqual(migrateSavedPlans(old), [
      { id: "t", title: "T", groupId: null, sessionIds: [], copiedFromId: null, items: [], updatedAt: NOW },
      { id: "p", title: "P", groupId: "g1", sessionIds: ["s1"], copiedFromId: "t", items: [], updatedAt: NOW },
    ]);
    const current = [{ ...old[1], sessionIds: ["x"] }];
    assert.deepEqual(migrateSavedPlans(current), current, "new saves pass through");
    assert.equal(migrateSavedPlans("oops"), "oops");
  });
});
