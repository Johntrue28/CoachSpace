import GroupForm from "@/components/groups/GroupForm";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

/** Every scenario group is built in advance; groups created in the demo are opened on request (D-072). */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.groups.map((g) => g.id));
}

export const metadata = { title: "Edit group · CoachSpace" };

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupForm groupId={id} />;
}
