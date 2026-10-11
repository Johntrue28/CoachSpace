"use client";

// Chat demo store.
// Holds the chat messages and what each demo user has read, for this visit only (in memory).
// Messages sent in the demo are never delivered to anyone and, like the read state, disappear
// when the page is reloaded (D-024, D-030). In a later phase, `sendMessage` and
// `markConversationRead` are the boundary to replace with a real messaging backend.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "./types";
import { COACH_SENDER_ID, seedChatMessages, seedReadState } from "./messages";
import { markRead, totalUnread, unreadCount, type ReadState } from "./unread";
import { newId } from "./store";

type ChatStore = {
  messages: ChatMessage[];
  /** False during the first server render, so dates are always formatted in the viewer's time zone. */
  ready: boolean;
  /** The conversation the coach opened last, highlighted in the list. */
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  /** Adds a message from the demo user (the coach by default). Returns false if the text is empty. */
  sendMessage: (conversationId: string, body: string, senderId?: string) => boolean;
  /** Marks everything currently in the conversation as read for this demo user. */
  markConversationRead: (conversationId: string, viewerId: string) => void;
  /** Unread messages from other people in one conversation. */
  unreadIn: (conversationId: string, viewerId?: string) => number;
  /** Unread messages over several conversations. */
  unreadTotal: (conversationIds: string[], viewerId?: string) => number;
};

const ChatStoreContext = createContext<ChatStore | null>(null);

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedChatMessages);
  const [ready, setReady] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [readState, setReadState] = useState<ReadState>(seedReadState);

  useEffect(() => setReady(true), []);

  const sendMessage = useCallback((conversationId: string, body: string, senderId = COACH_SENDER_ID) => {
    const text = body.trim();
    if (!text) return false;
    const message: ChatMessage = {
      id: newId("msg"),
      conversationId,
      senderId,
      body: text,
      sentAt: new Date().toISOString(),
      local: true,
    };
    setMessages((prev) => [...prev, message]);
    return true;
  }, []);

  const markConversationRead = useCallback(
    (conversationId: string, viewerId: string) =>
      setReadState((prev) => markRead(prev, messages, viewerId, conversationId)),
    [messages],
  );

  const unreadIn = useCallback(
    (conversationId: string, viewerId = COACH_SENDER_ID) => unreadCount(readState, messages, viewerId, conversationId),
    [readState, messages],
  );

  const unreadTotal = useCallback(
    (conversationIds: string[], viewerId = COACH_SENDER_ID) => totalUnread(readState, messages, viewerId, conversationIds),
    [readState, messages],
  );

  const value = useMemo(
    () => ({
      messages,
      ready,
      activeConversationId,
      setActiveConversationId,
      sendMessage,
      markConversationRead,
      unreadIn,
      unreadTotal,
    }),
    [messages, ready, activeConversationId, sendMessage, markConversationRead, unreadIn, unreadTotal],
  );

  return <ChatStoreContext.Provider value={value}>{children}</ChatStoreContext.Provider>;
}

export function useChatStore() {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error("useChatStore must be used inside <ChatStoreProvider>");
  return store;
}
