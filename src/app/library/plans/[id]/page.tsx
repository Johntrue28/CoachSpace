import PlanEditor from "@/components/plans/PlanEditor";

export const metadata = { title: "Session plan · CoachSpace" };

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  // Keyed by id so moving from one plan to its copy starts a fresh editor.
  return <PlanEditor key={id} planId={id} fromSession={from === "session"} />;
}
