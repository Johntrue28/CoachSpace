import GroupAssign from "@/components/groups/GroupAssign";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

/** Group ids of every demo scenario, so each page is built in advance (D-054). */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.groups.map((g) => g.id));
}

export const metadata = { title: "Assign exercises · CoachSpace" };

/** Group-first assignment (D-059): several exercises for one group at once. */
export default async function GroupAssignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupAssign groupId={id} />;
}
