import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { applyScenario } from "@/data/scenario";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";
import { pilates } from "@/data/scenarios/pilates";
import { seedSessionPlans } from "@/data/seed-plans";
import { planOutline, planForSession, totalMinutes } from "@/data/plans";
import { sessionById, upcomingSessions } from "@/data/calendar";
import { groupIdsOf, DEMO_PARTICIPANT_ID } from "@/data/groups";

afterEach(() => applyScenario(tennis));
const now = new Date(2026, 9, 14, 12, 0); // Wednesday 14 October 2026, 12:00

describe("session plans prepared in advance (D-058)", () => {
  for (const s of [tennis, football, basketball, pilates]) {
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
    applyScenario(pilates);
    const plan = { ...pilates.plans.find((p) => p.id === "t-reformer")! };
    plan.items = plan.items.map((i, n) => (n === 0 ? { ...i, instructions: "Slow breathing for five rounds." } : i));
    const outline = planOutline(plan, pilates.exercises);
    assert.deepEqual(outline.map((b) => b.label), ["Centring", "Foundation", "Main sequence", "Stretch and close"]);
    assert.equal(outline[0].items[0].text, "Slow breathing for five rounds.");
    const second = outline[1].items[0];
    assert.equal(second.text, pilates.exercises.find((e) => e.id === second.exerciseId)!.description);
    assert.match(second.safetyNote ?? "", /not medical advice/);
    // An exercise that no longer exists is left out rather than shown blank.
    assert.equal(planOutline(plan, pilates.exercises.filter((e) => e.id !== "e1")).flatMap((b) => b.items).length, plan.items.length - 1);
  });
});
