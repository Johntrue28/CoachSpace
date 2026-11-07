import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { applyScenario } from "@/data/scenario";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";
import { seedSessionPlans } from "@/data/seed-plans";
import { planOutline, planForSession, totalMinutes } from "@/data/plans";
import { sessionById, upcomingSessions } from "@/data/calendar";
import { groupIdsOf, DEMO_PARTICIPANT_ID } from "@/data/groups";

afterEach(() => applyScenario(tennis));
const now = new Date(2026, 9, 14, 12, 0); // Wednesday 14 October 2026, 12:00

describe("session plans prepared in advance (D-058)", () => {
  for (const s of [tennis, football, basketball]) {
    test(`${s.id}: each seed becomes the plan of the group's next session`, () => {
      applyScenario(s);
      const before = structuredClone(s.plans);
      const seeded = seedSessionPlans(s.plans, s.sessionPlanSeeds, now);
      assert.equal(seeded.length, s.sessionPlanSeeds!.length);
      for (const [i, plan] of seeded.entries()) {
        const seed = s.sessionPlanSeeds![i];
        const next = upcomingSessions(now, { limit: 1, groupId: seed.groupId, activeOnly: true })[0];
        const template = s.plans.find((p) => p.id === seed.templateId)!;
        assert.equal(plan.kind, "plan");
        assert.equal(plan.sessionId, next.id);
        assert.equal(plan.groupId, seed.groupId);
        assert.equal(plan.copiedFromId, template.id);
        assert.equal(totalMinutes(plan), totalMinutes(template));
        assert.ok(sessionById(plan.sessionId!), "a real session");
        assert.equal(planForSession([...s.plans, ...seeded], next.id)?.id, plan.id);
        // Every item points to an exercise of this scenario, so the outline loses nothing.
        const outline = planOutline(plan, s.exercises);
        assert.equal(outline.flatMap((b) => b.items).length, plan.items.length);
      }
      // The participant view has a plan to show in at least one of Jordan's groups.
      assert.ok(seeded.some((p) => groupIdsOf(DEMO_PARTICIPANT_ID).includes(p.groupId!)), "a plan in the demo participant's groups");
      assert.deepEqual(seedSessionPlans(s.plans, s.sessionPlanSeeds, now), seeded, "the same on every visit");
      // The template is not changed by the copy.
      assert.deepEqual(s.plans, before);
    });
  }

  test("no plan when the template or an upcoming session is missing", () => {
    applyScenario(tennis);
    assert.deepEqual(seedSessionPlans(tennis.plans, [{ groupId: "g1", templateId: "missing" }], now), []);
    assert.deepEqual(seedSessionPlans(tennis.plans, [{ groupId: "nope", templateId: "t-junior" }], now), []);
    assert.deepEqual(seedSessionPlans(tennis.plans, undefined, now), []);
  });

  test("the participant outline uses the plan's instructions, else the exercise description, in block order", () => {
    applyScenario(tennis);
    const source = tennis.plans.find((p) => p.items.length >= 2)!;
    const plan = { ...source, items: source.items.map((i, n) => (n === 0 ? { ...i, instructions: "Slow breathing for five rounds." } : { ...i, instructions: "" })) };
    const outline = planOutline(plan, tennis.exercises);
    assert.deepEqual(outline.map((b) => b.label), ["Warm-up", "Technical", "Tactical", "Cool-down"]);
    const items = outline.flatMap((b) => b.items);
    assert.ok(items.some((i) => i.text === "Slow breathing for five rounds."));
    const other = items.find((i) => i.text !== "Slow breathing for five rounds.")!;
    assert.equal(other.text, tennis.exercises.find((e) => e.id === other.exerciseId)!.description);
    // An exercise that no longer exists is left out rather than shown blank.
    const gone = plan.items[0].exerciseId;
    assert.equal(planOutline(plan, tennis.exercises.filter((e) => e.id !== gone)).flatMap((b) => b.items).length, plan.items.filter((i) => i.exerciseId !== gone).length);
  });
});
