import { Suspense } from "react";
import AssignRoute, { AssignFallback } from "@/components/library/AssignRoute";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

export const metadata = { title: "Assign exercise · CoachSpace" };

/** The demo exercises of every scenario are built in advance; exercises added in the browser are built on request. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.exercises.map((e) => e.id));
}

export default async function AssignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<AssignFallback exerciseId={id} />}>
      <AssignRoute exerciseId={id} />
    </Suspense>
  );
}
