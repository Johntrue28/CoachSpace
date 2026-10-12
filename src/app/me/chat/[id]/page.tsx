import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import ConversationView from "@/components/chat/ConversationView";
import { demoParticipantGroupIds, paramsFromAllScenarios } from "@/data/scenarios/all";

/** The demo participant's conversations in every scenario: their group chats and their own chat. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => {
    const groupIds = demoParticipantGroupIds(s);
    return s.conversations
      .filter((c) => (c.kind === "group" ? groupIds.includes(c.groupId) : c.participantId === s.demoParticipantId))
      .map((c) => c.id);
  });
}

export const dynamicParams = false;

export const metadata = { title: "Chat · CoachSpace" };

export default async function ParticipantConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ConversationView checks in the browser that the conversation is one of the participant's own.
  return <ConversationView id={id} viewerId={DEMO_PARTICIPANT_ID} basePath="/me/chat" groupPath="/me/groups" />;
}
