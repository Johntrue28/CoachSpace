import ChatShell from "@/components/chat/ChatShell";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatShell basePath="/chat" description="Group chats and one-to-one conversations with your participants.">
      {children}
    </ChatShell>
  );
}
