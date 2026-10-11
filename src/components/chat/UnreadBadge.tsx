"use client";

import { useChatStore } from "@/data/chat-store";
import { COACH_SENDER_ID, conversationsFor } from "@/data/messages";

/** Accent pill with the unread count of one conversation; renders nothing when all is read. */
export default function UnreadBadge({
  conversationId,
  viewerId = COACH_SENDER_ID,
  label = "unread",
}: {
  conversationId: string | undefined;
  viewerId?: string;
  label?: string;
}) {
  const { unreadIn } = useChatStore();
  const count = conversationId ? unreadIn(conversationId, viewerId) : 0;
  if (count === 0) return null;
  return (
    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-ink">
      {count}
      <span className="sr-only"> {label}</span>
    </span>
  );
}

/** Total unread messages over all of a viewer's conversations. */
export function useUnreadTotal(viewerId = COACH_SENDER_ID) {
  const { unreadTotal } = useChatStore();
  return unreadTotal(
    conversationsFor(viewerId).map((c) => c.id),
    viewerId,
  );
}
