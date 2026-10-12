import NoConversation from "@/components/chat/NoConversation";

export const metadata = { title: "Chat · CoachSpace" };

/** The list comes from the chat layout; from 1024 px this fills the conversation side. */
export default function ChatPage() {
  return <NoConversation />;
}
