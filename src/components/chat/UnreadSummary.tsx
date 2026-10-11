"use client";

import Link from "next/link";
import { useChatStore } from "@/data/chat-store";
import { COACH_SENDER_ID, conversationsFor, conversationTitle } from "@/data/messages";
import { ChevronRightIcon } from "@/components/Icons";
import UnreadBadge from "./UnreadBadge";

/** Conversations with unread messages, for the home page. Renders nothing when all is read. */
export default function UnreadSummary({ viewerId = COACH_SENDER_ID, basePath = "/chat" }: { viewerId?: string; basePath?: string }) {
  const { unreadIn } = useChatStore();
  const unread = conversationsFor(viewerId).filter((c) => unreadIn(c.id, viewerId) > 0);
  if (unread.length === 0) return null;
  return (
    <section className="mx-4 mt-4 rounded-2xl bg-card p-4 ring-1 ring-line" aria-labelledby="unread-summary">
      <div className="mb-1 flex items-center justify-between">
        <h2 id="unread-summary" className="font-bold">
          New messages
        </h2>
        <Link href={basePath} className="text-sm font-semibold text-brand-strong">
          Open chat
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {unread.map((c) => (
          <li key={c.id}>
            <Link href={`${basePath}/${c.id}`} className="flex items-center gap-3 py-2.5">
              <p className="min-w-0 flex-1 truncate font-medium">{conversationTitle(c, viewerId)}</p>
              <UnreadBadge conversationId={c.id} viewerId={viewerId} />
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
