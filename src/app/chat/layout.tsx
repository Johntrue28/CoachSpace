import ChatShell from "@/components/chat/ChatShell";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatShell basePath="/chat">
      {children}
    </ChatShell>
  );
}
