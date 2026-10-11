import { notFound } from "next/navigation";
import { conversationById, conversations, conversationTitle } from "@/data/messages";
import ConversationView from "@/components/chat/ConversationView";

export function generateStaticParams() {
  return conversations.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = conversationById(id);
  return { title: `${conversation ? conversationTitle(conversation) : "Chat"} · CoachSpace` };
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!conversationById(id)) notFound();
  return <ConversationView id={id} />;
}
