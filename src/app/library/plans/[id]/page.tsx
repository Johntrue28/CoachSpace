import PlanEditor from "@/components/plans/PlanEditor";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

export const metadata = { title: "Plan · CoachSpace" };

/** The demo plans of every scenario are built in advance; plans made in the browser are built on request. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.plans.map((p) => p.id));
}

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Keyed by id so moving from one plan to its copy starts a fresh editor.
  return <PlanEditor key={id} planId={id} />;
}
