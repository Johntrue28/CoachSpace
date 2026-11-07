import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { applyScenario } from "@/data/scenario";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";
import { seedSessionPlans } from "@/data/seed-plans";
import { planTimeline, planForSession, totalMinutes } from "@/data/plans";
import { sessionById, upcomingSessions } from "@/data/calendar";
import { groupIdsOf, DEMO_PARTICIPANT_ID } from "@/data/groups";

afterEach(() => applyScenario(tennis));
const now = new Date(2026, 9, 14, 12, 0); // Wednesday 14 October 2026, 12:00

describe("plans used in the next sessions in advance (D-058, D-076)", () => {
  for (const s of [tennis, football, basketball]) {
    test(`${s.id}: each seed's plan is used in its group's next session`, () => {
      applyScenario(s);
      const before = structuredClone(s.plans);
      const seeded = seedSessionPlans(s.plans, s.sessionPlanSeeds, now);
      for (const seed of s.sessionPlanSeeds!) {
        const next = upcomingSessions(now, { limit: 1, groupId: seed.groupId, activeOnly: true })[0];
        const plan = planForSession(seeded, next.id)!;
        const source = s.plans.find((p) => p.id === seed.planId)!;
        assert.ok(plan, `${seed.groupId} has a plan for its next session`);
        assert.equal(plan.groupId, seed.groupId);
        assert.ok(plan.id === source.id || plan.copiedFromId === source.id, "the seed's plan or a copy of it");
        assert.equal(totalMinutes(plan), totalMinutes(source));
        assert.ok(sessionById(next.id), "a real session");
        // Every item points to an exercise of this scenario, so the plan view loses nothing.
        const timeline = planTimeline(plan, s.exercises);
        assert.equal(timeline.blocks.flatMap((b) => b.steps).length, plan.items.length);
        assert.equal(timeline.total, totalMinutes(plan));
      }
      // The player view has a plan to show in at least one of Jordan's groups.
      assert.ok(seeded.some((p) => p.sessionIds.length > 0 && groupIdsOf(DEMO_PARTICIPANT_ID).includes(p.groupId!)), "a plan in the demo player's groups");
      assert.deepEqual(seedSessionPlans(s.plans, s.sessionPlanSeeds, now), seeded, "the same on every visit");
      // The scenario's own data is not changed.
      assert.deepEqual(s.plans, before);
    });
  }

  test("nothing changes when the plan or an upcoming session is missing", () => {
    applyScenario(tennis);
    assert.deepEqual(seedSessionPlans(tennis.plans, [{ groupId: "g1", planId: "missing" }], now), tennis.plans);
    assert.deepEqual(seedSessionPlans(tennis.plans, [{ groupId: "nope", planId: "t-junior" }], now), tennis.plans);
    assert.deepEqual(seedSessionPlans(tennis.plans, undefined, now), tennis.plans);
  });

  test("the plan view counts start and end minutes in block order and uses the plan's text, else the exercise's", () => {
    applyScenario(tennis);
    const source = tennis.plans.find((p) => p.items.length >= 2)!;
    const plan = { ...source, items: source.items.map((i, n) => (n === 0 ? { ...i, instructions: "Slow breathing for five rounds." } : { ...i, instructions: "" })) };
    const { blocks, total } = planTimeline(plan, tennis.exercises);
    assert.deepEqual(blocks.map((b) => b.label), ["Warm-up", "Technical", "Tactical", "Cool-down"].filter((l) => blocks.some((b) => b.label === l)));
    const steps = blocks.flatMap((b) => b.steps);
    assert.equal(steps[0].start, 0);
    for (let i = 1; i < steps.length; i++) assert.equal(steps[i].start, steps[i - 1].end, "each exercise starts when the one before ends");
    assert.equal(steps.at(-1)!.end, total);
    assert.equal(total, totalMinutes(plan));
    assert.ok(steps.some((st) => st.text === "Slow breathing for five rounds."));
    const other = steps.find((st) => st.text !== "Slow breathing for five rounds.")!;
    const exercise = tennis.exercises.find((e) => e.id === other.exerciseId)!;
    assert.equal(other.text, exercise.description);
    assert.deepEqual(other.coachingPoints, exercise.coachingPoints ?? []);
    // An exercise that no longer exists is left out rather than shown blank, and the minutes follow.
    const gone = plan.items[0].exerciseId;
    const without = planTimeline(plan, tennis.exercises.filter((e) => e.id !== gone));
    assert.equal(without.blocks.flatMap((b) => b.steps).length, plan.items.filter((i) => i.exerciseId !== gone).length);
    assert.equal(without.total, plan.items.filter((i) => i.exerciseId !== gone).reduce((n, i) => n + i.durationMin, 0));
  });
});
