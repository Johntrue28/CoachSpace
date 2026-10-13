import ConversationView from "@/components/chat/ConversationView";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

/** Conversation ids of every demo scenario, built in advance. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.conversations.map((c) => c.id));
}

export const metadata = { title: "Chat · CoachSpace" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConversationView id={id} />;
}
