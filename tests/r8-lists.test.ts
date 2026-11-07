// Redesign step R8: Library list rules and the calendar's agenda on phones.
import "./fixtures/use-harbour";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { filterExercises, groupsUsing, usageLabel, usedCategories } from "@/data/library";
import { hasEarlierDays, monthAgendaDays } from "@/data/calendar";
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
  test("sport and category filters combine", () => {
    assert.deepEqual(filterExercises(list, { discipline: "General" }).map((e) => e.id), ["c"]);
    assert.deepEqual(filterExercises(list, { category: "Warm-up", query: "court" }).map((e) => e.id), ["b"]);
    assert.deepEqual(filterExercises(list, { discipline: "Pilates" }), []);
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

describe("month agenda on phones", () => {
  test("the current month starts today; earlier days on request", () => {
    const days = monthAgendaDays("2026-11", "2026-11-06");
    assert.equal(days[0], "2026-11-06");
    assert.equal(days.at(-1), "2026-11-30");
    assert.equal(days.length, 25);
    assert.equal(monthAgendaDays("2026-11", "2026-11-06", { earlier: true }).length, 30);
  });
  test("other months show every day, leap years included", () => {
    assert.equal(monthAgendaDays("2026-12", "2026-11-06").length, 31);
    assert.equal(monthAgendaDays("2028-02", "2026-11-06").length, 29);
    assert.equal(monthAgendaDays("2026-10", "2026-11-06")[0], "2026-10-01");
  });
  test("earlier days exist only in the current month after the 1st", () => {
    assert.equal(hasEarlierDays("2026-11", "2026-11-06"), true);
    assert.equal(hasEarlierDays("2026-11", "2026-11-01"), false);
    assert.equal(hasEarlierDays("2026-12", "2026-11-06"), false);
  });
});
