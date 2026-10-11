"use client";

import Link from "next/link";
import { COACH_SENDER_ID } from "@/data/messages";
import { formatBadgeCount } from "@/data/unread";
import { ChatIcon } from "@/components/Icons";
import { CountBadge } from "@/components/ui/Badge";
import { useUnreadTotal } from "./UnreadBadge";

/** Chat icon with a compact unread badge (1–5, then "5+"); opens the chat list. */
export default function ChatNotification({
  viewerId = COACH_SENDER_ID,
  href = "/chat",
  className = "",
}: {
  viewerId?: string;
  href?: string;
  className?: string;
}) {
  const total = useUnreadTotal(viewerId);
  const text = formatBadgeCount(total);
  return (
    <Link
      href={href}
      aria-label={total > 0 ? `Chat, ${total} unread message${total === 1 ? "" : "s"}` : "Chat, no unread messages"}
      className={`relative grid h-10 w-10 place-items-center rounded-full ${className}`}
    >
      <ChatIcon className="h-6 w-6" />
      {text && <CountDot text={text} />}
    </Link>
  );
}

/** The unread count on the corner of an icon (same style as every other unread badge). */
export function CountDot({ text }: { text: string }) {
  return <CountBadge text={text} overlay />;
}
