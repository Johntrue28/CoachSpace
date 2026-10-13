"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/data/chat-store";
import {
  COACH_SENDER_ID,
  conversationById,
  conversationGroupId,
  conversationsFor,
  conversationSubtitle,
  conversationTitle,
  messagesOf,
  senderName,
} from "@/data/messages";
import Avatar from "@/components/Avatar";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { SendIcon } from "@/components/Icons";
import { formatDay, formatTime, sameDay } from "@/components/format";
import BackLink from "@/components/navigation/BackLink";
import { Loading } from "@/components/ui/EmptyState";

/**
 * One conversation, seen by the coach (default) or, with `viewerId`, by a participant.
 * `basePath` and `groupPath` keep the links inside the current view.
 */
export default function ConversationView({
  id,
  viewerId = COACH_SENDER_ID,
  basePath = "/chat",
  groupPath = "/groups",
}: {
  id: string;
  viewerId?: string;
  basePath?: string;
  groupPath?: string;
}) {
  const { messages, ready, sendMessage, setActiveConversationId, markConversationRead } = useChatStore();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // A participant can only open their own conversations.
  const conversation = viewerId === COACH_SENDER_ID || conversationsFor(viewerId).some((c) => c.id === id) ? conversationById(id) : undefined;
  const thread = messagesOf(messages, id);

  useEffect(() => setActiveConversationId(id), [id, setActiveConversationId]);

  // Opening a conversation marks it as read, and keeps it read while it stays open.
  useEffect(() => {
    if (ready) markConversationRead(id, viewerId);
  }, [ready, id, viewerId, thread.length, markConversationRead]);

  // Show the latest message when the conversation opens and after each new message.
  useEffect(() => {
    if (ready) endRef.current?.scrollIntoView({ block: "end" });
  }, [ready, thread.length]);

  if (!conversation) {
    return (
      <div className="px-4 py-6">
        <BackLink fallback={basePath} fallbackLabel="Chats" />
        <p className="mt-6 text-sm text-ink-soft">This conversation is not available in this demo.</p>
      </div>
    );
  }

  const title = conversationTitle(conversation, viewerId);
  const groupId = conversationGroupId(conversation);
  const canSend = draft.trim().length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sendMessage(id, draft, viewerId)) setDraft("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--shell-header-h)-var(--bottom-nav-h)-1.5rem)] w-full flex-1 flex-col lg:min-h-0">
      <header className="sticky top-(--shell-header-h) z-10 border-b border-line bg-card/95 px-4 py-3 backdrop-blur lg:static lg:bg-card">
        <div className="flex items-center gap-3">
          <BackLink fallback={basePath} fallbackLabel="Chats" iconOnly className="-ml-1" />
          <Avatar name={title} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-bold">{title}</h1>
            <p className="truncate text-xs text-ink-soft">{conversationSubtitle(conversation, viewerId)}</p>
          </div>
          {groupId && (
            <Link href={`${groupPath}/${groupId}`} className="shrink-0 text-sm font-semibold text-brand-strong">
              View group
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 bg-canvas px-4 pt-3 lg:min-h-0 lg:overflow-y-auto lg:px-6">
        <DeviceOnlyNotice>
          messages you send here are not delivered to anyone. They are saved in this browser only.
        </DeviceOnlyNotice>

        {!ready ? (
          <Loading block />
        ) : thread.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">
            No messages yet. Write the first message to {title.split(" ")[0]} below.
          </p>
        ) : (
          <ol role="log" aria-live="polite" aria-label={`Messages with ${title}`} className="mt-3 space-y-2 pb-3">
            {thread.map((m, i) => {
              const mine = m.senderId === viewerId;
              const prev = thread[i - 1];
              const newDay = !prev || !sameDay(prev.sentAt, m.sentAt);
              const showName = !mine && conversation.kind === "group" && (newDay || prev.senderId !== m.senderId);
              return (
                <li key={m.id}>
                  {newDay && (
                    <p className="my-3 text-center text-xs font-semibold text-ink-soft">{formatDay(m.sentAt)}</p>
                  )}
                  <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                    {!mine && conversation.kind === "group" && (
                      <div className={showName ? "" : "invisible"}>
                        <Avatar name={senderName(m.senderId)} size="sm" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        mine ? "rounded-br-md bg-brand-strong text-on-brand" : "rounded-bl-md bg-card shadow-card ring-1 ring-line"
                      }`}
                    >
                      {showName && <p className="mb-0.5 text-xs font-semibold text-brand-strong">{senderName(m.senderId)}</p>}
                      <span className="sr-only">{mine ? "You" : senderName(m.senderId)}: </span>
                      <p className="whitespace-pre-line break-words">{m.body}</p>
                      <p className={`mt-1 text-right text-label ${mine ? "text-on-brand" : "text-ink-soft"}`}>
                        <time dateTime={m.sentAt}>{formatTime(m.sentAt)}</time>
                        {m.local && " · Not delivered (demo)"}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div ref={endRef} className="scroll-mb-40" />
      </div>

      <form
        onSubmit={submit}
        className="sticky bottom-(--bottom-nav-h) flex items-center gap-2 border-t border-line bg-card px-4 py-3 lg:static"
      >
        <label htmlFor="chat-message" className="sr-only">
          Message to {title}
        </label>
        <input
          id="chat-message"
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message"
          autoComplete="off"
          maxLength={1000}
          className="w-full rounded-control bg-surface px-4 py-2.5 text-sm ring-1 ring-line outline-none placeholder:text-ink-soft focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={!canSend || !ready}
          aria-label="Send message"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-brand-strong text-on-brand shadow-brand disabled:opacity-40 disabled:shadow-none"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
