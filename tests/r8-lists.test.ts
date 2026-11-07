// Redesign step R8: Library list rules and the calendar's agenda on phones.
import "./fixtures/use-harbour";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { filterExercises, groupsUsing, usageLabel, usedCategories } from "@/data/library";
import type { Exercise } from "@/data/types";

const ex = (id: string, category: Exercise["category"], extra: Partial<Exercise> = {}): Exercise => ({
  id,
  title: `Exercise ${id}`,
  description: "",
  discipline: "Tennis",
  category,
  durationMin: 10,
  equipment: "",
  instructions: "",
  ...extra,
});

describe("library filters", () => {
  const list = [
    ex("a", "Mobility"),
    ex("b", "Warm-up", { title: "Court warm-up", equipment: "Cones" }),
    ex("c", "Technique", { discipline: "General", description: "Serve toss" }),
    ex("d", "Warm-up"),
  ];
  test("session order, warm-up first, keeping the original order within a category", () => {
    assert.deepEqual(filterExercises(list).map((e) => e.id), ["b", "d", "c", "a"]);
  });
  test("search looks at title, description, category and equipment, ignoring case and spaces", () => {
    assert.deepEqual(filterExercises(list, { query: " cones " }).map((e) => e.id), ["b"]);
    assert.deepEqual(filterExercises(list, { query: "TOSS" }).map((e) => e.id), ["c"]);
    assert.deepEqual(filterExercises(list, { query: "mobility" }).map((e) => e.id), ["a"]);
  });
  test("search and category filters combine", () => {
    assert.deepEqual(filterExercises(list, { category: "Warm-up", query: "court" }).map((e) => e.id), ["b"]);
    assert.deepEqual(filterExercises(list, { category: "Tactics" }), []);
  });
  test("only the categories in use, plus the selected one", () => {
    assert.deepEqual(usedCategories(list), ["Warm-up", "Technique", "Mobility"]);
    assert.deepEqual(usedCategories(list, "Tactics"), ["Warm-up", "Technique", "Tactics", "Mobility"]);
  });
  test("groups using an exercise count each group once", () => {
    const a = [
      { exerciseId: "b", groupId: "g1" },
      { exerciseId: "b", groupId: "g1" },
      { exerciseId: "b", groupId: "g2" },
      { exerciseId: "c", groupId: "g3" },
    ];
    assert.equal(groupsUsing(a, "b"), 2);
    assert.equal(groupsUsing(a, "z"), 0);
  });
  test("usage wording", () => {
    assert.equal(usageLabel(0), "Not assigned yet");
    assert.equal(usageLabel(1), "Used in 1 group");
    assert.equal(usageLabel(4), "Used in 4 groups");
  });
});
