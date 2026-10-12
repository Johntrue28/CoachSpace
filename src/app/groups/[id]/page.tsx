import GroupPage from "@/components/groups/GroupPage";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

/** Group ids of every demo scenario, so each group page is built in advance. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.groups.map((g) => g.id));
}

export const metadata = { title: "Group · CoachSpace" };

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupPage id={id} />;
}
