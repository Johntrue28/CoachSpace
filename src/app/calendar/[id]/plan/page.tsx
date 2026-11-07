import PlanView from "@/components/plans/PlanView";

export const metadata = { title: "Plan · CoachSpace" };

/** Sessions are checked in the browser: they depend on the date, the scenario and saved changes. */
export function generateStaticParams() {
  return [];
}

export default async function SessionPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanView sessionId={id} viewer="coach" />;
}
