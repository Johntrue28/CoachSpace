"use client";

import { useChatStore } from "@/data/chat-store";
import { COACH_SENDER_ID, conversationsFor } from "@/data/messages";
import { formatBadgeCount } from "@/data/unread";
import { CountBadge } from "@/components/ui/Badge";

/** Small pill with the unread count of one conversation ("5+" above five); nothing when all is read. */
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
  const text = formatBadgeCount(count);
  if (!text) return null;
  return (
    <span className="shrink-0">
      <CountBadge text={text} />
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  );
}

/** Total unread messages over all of a viewer's conversations (each message counted once). */
export function useUnreadTotal(viewerId = COACH_SENDER_ID) {
  const { unreadTotal } = useChatStore();
  return unreadTotal(
    conversationsFor(viewerId).map((c) => c.id),
    viewerId,
  );
}
