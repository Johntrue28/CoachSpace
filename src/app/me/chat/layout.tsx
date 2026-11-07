import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import ChatShell from "@/components/chat/ChatShell";

export default function ParticipantChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatShell viewerId={DEMO_PARTICIPANT_ID} basePath="/me/chat" participant>
      {children}
    </ChatShell>
  );
}
