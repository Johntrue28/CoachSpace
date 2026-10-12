import ParticipantGroupPage from "@/components/participant/ParticipantGroupPage";
import { demoParticipantGroupIds, paramsFromAllScenarios } from "@/data/scenarios/all";

/** The demo participant's groups in every scenario, built in advance. */
export function generateStaticParams() {
  return paramsFromAllScenarios(demoParticipantGroupIds);
}

export const metadata = { title: "My group · CoachSpace" };

export default async function ParticipantGroupRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ParticipantGroupPage id={id} />;
}
