// Session plans prepared in advance for the demo (D-058). Pure functions, no React.
// They depend on today's date, so the store builds them in the browser only, like the seeded
// attendance history.

import type { SessionPlan } from "./types";
import { upcomingSessions } from "./calendar";
import { copyPlan } from "./plans";

/**
 * For each seed, a copy of the template as the plan of the group's next session (if the group has
 * one in the next two weeks and the template exists). Ids are derived from the session, so the
 * result is the same on every visit on the same day.
 */
export function seedSessionPlans(plans: SessionPlan[], seeds: { groupId: string; templateId: string }[] = [], now: Date): SessionPlan[] {
  return seeds.flatMap(({ groupId, templateId }) => {
    const template = plans.find((p) => p.id === templateId && p.kind === "template");
    const next = upcomingSessions(now, { limit: 1, groupId, activeOnly: true })[0];
    if (!template || !next) return [];
    let n = 0;
    return [
      copyPlan(
        template,
        { kind: "plan", title: next.title, groupId, sessionId: next.id },
        { plan: `plan-${next.id}`, item: () => `plan-${next.id}-${++n}` },
        now.toISOString(),
      ),
    ];
  });
}
