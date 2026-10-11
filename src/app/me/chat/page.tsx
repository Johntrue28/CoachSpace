import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import ConversationList from "@/components/chat/ConversationList";

export const metadata = { title: "My chats · CoachSpace" };

export default function ParticipantChatPage() {
  return <ConversationList viewerId={DEMO_PARTICIPANT_ID} basePath="/me/chat" />;
}
