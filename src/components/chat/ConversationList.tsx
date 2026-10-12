"use client";

import Link from "next/link";
import { useState } from "react";
import { useChatStore } from "@/data/chat-store";
import {
  COACH_SENDER_ID,
  conversationsFor,
  conversationSubtitle,
  conversationTitle,
  lastMessageOf,
  senderName,
} from "@/data/messages";
import type { ChatMessage, Conversation } from "@/data/types";
import Avatar from "@/components/Avatar";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { SearchIcon } from "@/components/Icons";
import { formatListStamp } from "@/components/format";
import { Loading } from "@/components/ui/EmptyState";

type Row = { conversation: Conversation; title: string; last?: ChatMessage; unread: number };

/** Most recent first; conversations without messages go last. */
function byLatest(a: Row, b: Row) {
  return (b.last ? Date.parse(b.last.sentAt) : 0) - (a.last ? Date.parse(a.last.sentAt) : 0);
}

type Viewer = { viewerId: string; basePath: string };

/**
 * Conversation list for the coach (default) or, with `viewerId`, for a participant: search, then
 * group chats and one-to-one chats, latest first, with the last message, its time and unread count.
 */
export default function ConversationList({
  viewerId = COACH_SENDER_ID,
  basePath = "/chat",
}: Partial<Viewer>) {
  const { messages, ready, activeConversationId, unreadIn } = useChatStore();
  const [query, setQuery] = useState("");
  const viewer = { viewerId, basePath };
  const q = query.trim().toLowerCase();

  const rows: Row[] = conversationsFor(viewerId).map((c) => ({
    conversation: c,
    title: conversationTitle(c, viewerId),
    last: lastMessageOf(messages, c.id),
    unread: unreadIn(c.id, viewerId),
  }));
  const shown = q ? rows.filter((r) => r.title.toLowerCase().includes(q)) : rows;
  const groupRows = shown.filter((r) => r.conversation.kind === "group").sort(byLatest);
  const directRows = shown.filter((r) => r.conversation.kind === "direct").sort(byLatest);

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="pt-4 lg:sticky lg:top-0 lg:z-10 lg:bg-card lg:px-3 lg:pb-2 lg:pt-3">
        <label className="flex min-h-10 items-center gap-2 rounded-control bg-card px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand lg:bg-surface">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className="sr-only">Search conversations</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full min-w-0 bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft"
          />
        </label>
      </div>

      {!ready ? (
        <Loading block />
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No conversations yet.</p>
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No conversations match “{query}”.</p>
      ) : (
        <>
          <Section title="Group chats" rows={groupRows} activeId={activeConversationId} empty="No group chats." viewer={viewer} />
          <Section title="One-to-one" rows={directRows} activeId={activeConversationId} empty="No one-to-one chats." viewer={viewer} />
        </>
      )}

      <div className="mt-6 lg:mt-4 lg:px-3 lg:pb-3">
        <DeviceOnlyNotice>
          chat is simulated. Messages you send stay in this browser, are not delivered to anyone, and disappear when
          you reload the page.
        </DeviceOnlyNotice>
      </div>
    </div>
  );
}

function Section({
  title,
  rows,
  activeId,
  empty,
  viewer,
}: {
  title: string;
  rows: Row[];
  activeId: string | null;
  empty: string;
  viewer: Viewer;
}) {
  return (
    <section className="mt-5 lg:mt-3">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft lg:px-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-card bg-card p-4 text-sm text-ink-soft ring-1 ring-line lg:rounded-none lg:ring-0">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line lg:rounded-none lg:shadow-none lg:ring-0">
          {rows.map(({ conversation, title: name, last, unread }) => {
            const active = conversation.id === activeId;
            return (
              <li key={conversation.id}>
                <Link
                  href={`${viewer.basePath}/${conversation.id}`}
                  aria-current={active ? "true" : undefined}
                  className={`flex items-center gap-3 border-l-4 px-3 py-3 ${
                    active ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface"
                  }`}
                >
                  <Avatar name={name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-bold text-ink">{name}</p>
                      {last && (
                        <time dateTime={last.sentAt} className={`shrink-0 text-xs ${active ? "text-ink" : "text-ink-soft"}`}>
                          {formatListStamp(last.sentAt)}
                        </time>
                      )}
                    </div>
                    {/* Secondary text turns darker on the mint highlight to keep AA contrast (D-041). */}
                    <p className={`truncate text-xs ${active ? "text-ink" : "text-ink-soft"}`}>{conversationSubtitle(conversation, viewer.viewerId)}</p>
                    <p className={`mt-0.5 truncate text-sm ${unread > 0 ? "font-semibold text-ink" : active ? "text-ink" : "text-ink-soft"}`}>
                      {last ? (
                        <>
                          <span className="font-medium text-ink">
                            {last.senderId === viewer.viewerId ? "You" : senderName(last.senderId).split(" ")[0]}:
                          </span>{" "}
                          {last.body}
                        </>
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="shrink-0 rounded-full bg-brand-strong px-2 py-0.5 text-xs font-bold text-on-brand">
                      {unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
