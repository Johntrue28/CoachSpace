// Plans already used in the next sessions of the demo (D-058, D-076). Pure functions, no React.
// They depend on today's date, so the store builds them in the browser only, like the seeded
// attendance history.

import type { SessionPlan } from "./types";
import { upcomingSessions } from "./calendar";
import { duplicatePlan } from "./plans";

/**
 * The scenario's plans with each seed's plan used in its group's next session (if the group has one and the
 * plan exists). A plan not used yet is used directly (and becomes that group's plan); one already used gets a
 * copy for the other group. Ids come from the session, so the result is the same on every visit on the same day.
 */
export function seedSessionPlans(plans: SessionPlan[], seeds: { groupId: string; planId: string }[] = [], now: Date): SessionPlan[] {
  let out = plans;
  for (const { groupId, planId } of seeds) {
    const source = out.find((p) => p.id === planId);
    const next = upcomingSessions(now, { limit: 1, groupId, activeOnly: true })[0];
    if (!source || !next) continue;
    if (source.sessionIds.length === 0 && (source.groupId === null || source.groupId === groupId)) {
      out = out.map((p) => (p.id === source.id ? { ...p, groupId, sessionIds: [next.id] } : p));
    } else {
      let n = 0;
      const copy = duplicatePlan(source, { plan: `plan-${next.id}`, item: () => `plan-${next.id}-${++n}` }, now.toISOString(), source.title);
      out = [...out, { ...copy, groupId, sessionIds: [next.id] }];
    }
  }
  return out;
}
