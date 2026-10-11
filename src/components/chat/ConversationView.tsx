"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/data/chat-store";
import {
  COACH_SENDER_ID,
  conversationById,
  conversationGroupId,
  conversationSubtitle,
  conversationTitle,
  messagesOf,
  senderName,
} from "@/data/messages";
import Avatar from "@/components/Avatar";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { ArrowLeftIcon, SendIcon } from "@/components/Icons";
import { formatDay, formatTime, sameDay } from "@/components/format";

export default function ConversationView({ id }: { id: string }) {
  const { messages, ready, sendMessage, setActiveConversationId } = useChatStore();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const conversation = conversationById(id);
  const thread = messagesOf(messages, id);

  useEffect(() => setActiveConversationId(id), [id, setActiveConversationId]);

  // Show the latest message when the conversation opens and after each new message.
  useEffect(() => {
    if (ready) endRef.current?.scrollIntoView({ block: "end" });
  }, [ready, thread.length]);

  if (!conversation) return null;

  const title = conversationTitle(conversation);
  const groupId = conversationGroupId(conversation);
  const canSend = draft.trim().length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sendMessage(id, draft)) setDraft("");
    inputRef.current?.focus();
  }

  return (
    <main className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/chat" aria-label="Back to all chats" className="-ml-1 rounded-full p-1 text-brand">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <Avatar name={title} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-bold">{title}</h1>
            <p className="truncate text-xs text-ink-soft">{conversationSubtitle(conversation)}</p>
          </div>
          {groupId && (
            <Link href={`/groups/${groupId}`} className="shrink-0 text-sm font-semibold text-brand">
              View group
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 px-4 pt-3">
        <DeviceOnlyNotice>
          messages you send here are not delivered to anyone. They stay in this browser until you reload the page.
        </DeviceOnlyNotice>

        {!ready ? (
          <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>
        ) : thread.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">
            No messages yet. Write the first message to {title.split(" ")[0]} below.
          </p>
        ) : (
          <ol role="log" aria-live="polite" aria-label={`Messages with ${title}`} className="mt-3 space-y-2 pb-3">
            {thread.map((m, i) => {
              const mine = m.senderId === COACH_SENDER_ID;
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
                        mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-card ring-1 ring-line"
                      }`}
                    >
                      {showName && <p className="mb-0.5 text-xs font-semibold text-brand">{senderName(m.senderId)}</p>}
                      <span className="sr-only">{mine ? "You" : senderName(m.senderId)}: </span>
                      <p className="whitespace-pre-line break-words">{m.body}</p>
                      <p className={`mt-1 text-right text-[11px] ${mine ? "text-white/80" : "text-ink-soft"}`}>
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
        className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] flex items-center gap-2 border-t border-line bg-surface px-4 py-3"
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
          className="w-full rounded-full bg-card px-4 py-2.5 text-sm ring-1 ring-line outline-none placeholder:text-ink-soft focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={!canSend || !ready}
          aria-label="Send message"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white disabled:opacity-40"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>
    </main>
  );
}
