"use client";

import Link from "next/link";
import { useChatStore } from "@/data/chat-store";
import { COACH_SENDER_ID, conversationsFor, conversationTitle, lastMessageOf, senderName } from "@/data/messages";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon } from "@/components/Icons";
import { formatListStamp } from "@/components/format";
import { useNow } from "@/components/useNow";
import { cardClass } from "@/components/ui/Card";
import UnreadBadge from "./UnreadBadge";

/**
 * Conversations with unread messages, for the home pages (Figma "Unread messages"): who, the latest
 * message and when. Renders nothing when everything is read.
 */
export default function UnreadSummary({
  viewerId = COACH_SENDER_ID,
  basePath = "/chat",
  className = "",
}: {
  viewerId?: string;
  basePath?: string;
  className?: string;
}) {
  const { unreadIn, messages } = useChatStore();
  const now = useNow();
  const unread = conversationsFor(viewerId).filter((c) => unreadIn(c.id, viewerId) > 0);
  if (unread.length === 0) return null;
  return (
    <section className={cardClass({ className: `sm:p-5 ${className}` })} aria-labelledby="unread-summary">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id="unread-summary" className="text-base font-bold text-ink">
          New messages
        </h2>
        <Link href={basePath} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-strong hover:underline">
          Open chat
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {unread.map((c) => {
          const title = conversationTitle(c, viewerId);
          const last = lastMessageOf(messages, c.id);
          const preview = last
            ? `${c.kind === "group" && last.senderId !== viewerId ? `${senderName(last.senderId).split(" ")[0]}: ` : ""}${last.body}`
            : "";
          return (
            <li key={c.id}>
              <Link href={`${basePath}/${c.id}`} className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-surface">
                <Avatar name={title} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{title}</p>
                    {now && last && <span className="shrink-0 text-xs text-ink-soft">{formatListStamp(last.sentAt, now)}</span>}
                  </div>
                  <p className="truncate text-sm text-ink-soft">{preview}</p>
                </div>
                <UnreadBadge conversationId={c.id} viewerId={viewerId} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
