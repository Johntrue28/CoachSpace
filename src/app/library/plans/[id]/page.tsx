import { Suspense } from "react";
import PlanRoute, { PlanFallback } from "@/components/plans/PlanRoute";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

export const metadata = { title: "Session plan · CoachSpace" };

/** The demo templates of every scenario are built in advance; plans made in the browser are built on request. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.plans.map((p) => p.id));
}

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PlanFallback planId={id} />}>
      <PlanRoute planId={id} />
    </Suspense>
  );
}
