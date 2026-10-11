"use client";

import Link from "next/link";
import { useChatStore } from "@/data/chat-store";
import {
  COACH_SENDER_ID,
  conversations,
  conversationSubtitle,
  conversationTitle,
  lastMessageOf,
  senderName,
} from "@/data/messages";
import type { ChatMessage, Conversation } from "@/data/types";
import Avatar from "@/components/Avatar";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { ChevronRightIcon } from "@/components/Icons";
import { formatListStamp } from "./format";

type Row = { conversation: Conversation; last?: ChatMessage };

/** Most recent first; conversations without messages go last. */
function byLatest(a: Row, b: Row) {
  return (b.last ? Date.parse(b.last.sentAt) : 0) - (a.last ? Date.parse(a.last.sentAt) : 0);
}

export default function ConversationList() {
  const { messages, ready, activeConversationId } = useChatStore();

  const rows: Row[] = conversations.map((c) => ({ conversation: c, last: lastMessageOf(messages, c.id) }));
  const groupRows = rows.filter((r) => r.conversation.kind === "group").sort(byLatest);
  const directRows = rows.filter((r) => r.conversation.kind === "direct").sort(byLatest);

  return (
    <main className="px-4 pt-8">
      <h1 className="text-2xl font-bold">Chat</h1>
      <p className="mt-1 text-sm text-ink-soft">Group chats and one-to-one conversations with your participants.</p>

      {!ready ? (
        <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No conversations yet.</p>
      ) : (
        <>
          <Section title="Group chats" rows={groupRows} activeId={activeConversationId} empty="No group chats yet." />
          <Section title="One-to-one" rows={directRows} activeId={activeConversationId} empty="No one-to-one chats yet." />
        </>
      )}

      <div className="mt-6">
        <DeviceOnlyNotice>
          chat is simulated. Messages you send stay in this browser, are not delivered to anyone, and disappear when
          you reload the page.
        </DeviceOnlyNotice>
      </div>
    </main>
  );
}

function Section({
  title,
  rows,
  activeId,
  empty,
}: {
  title: string;
  rows: Row[];
  activeId: string | null;
  empty: string;
}) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-sm text-ink-soft ring-1 ring-line">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card ring-1 ring-line">
          {rows.map(({ conversation, last }) => {
            const active = conversation.id === activeId;
            const name = conversationTitle(conversation);
            return (
              <li key={conversation.id}>
                <Link
                  href={`/chat/${conversation.id}`}
                  aria-current={active ? "true" : undefined}
                  className={`flex items-center gap-3 border-l-4 px-3 py-3 ${
                    active ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface"
                  }`}
                >
                  <Avatar name={name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{name}</p>
                      {last && (
                        <time dateTime={last.sentAt} className="shrink-0 text-xs text-ink-soft">
                          {formatListStamp(last.sentAt)}
                        </time>
                      )}
                    </div>
                    <p className="truncate text-xs text-ink-soft">{conversationSubtitle(conversation)}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-soft">
                      {last ? (
                        <>
                          <span className="font-medium text-ink">
                            {last.senderId === COACH_SENDER_ID ? "You" : senderName(last.senderId).split(" ")[0]}:
                          </span>{" "}
                          {last.body}
                        </>
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
