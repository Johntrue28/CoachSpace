import { notFound } from "next/navigation";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import { conversationsFor, conversationTitle } from "@/data/messages";
import ConversationView from "@/components/chat/ConversationView";

const mine = () => conversationsFor(DEMO_PARTICIPANT_ID);

export function generateStaticParams() {
  return mine().map((c) => ({ id: c.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = mine().find((x) => x.id === id);
  return { title: `${c ? conversationTitle(c, DEMO_PARTICIPANT_ID) : "Chat"} · CoachSpace` };
}

export default async function ParticipantConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // A participant can only open their own conversations.
  if (!mine().some((c) => c.id === id)) notFound();
  return <ConversationView id={id} viewerId={DEMO_PARTICIPANT_ID} basePath="/me/chat" groupPath="/me/groups" />;
}
