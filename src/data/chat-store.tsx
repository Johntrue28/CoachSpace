"use client";

// Chat demo store.
// Holds the chat messages for this visit only (in memory). Messages sent in the demo are
// never delivered to anyone and disappear when the page is reloaded. In a later phase,
// `sendMessage` is the boundary to replace with a real messaging backend.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "./types";
import { COACH_SENDER_ID, seedChatMessages } from "./messages";
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
};

const ChatStoreContext = createContext<ChatStore | null>(null);

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedChatMessages);
  const [ready, setReady] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

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

  const value = useMemo(
    () => ({ messages, ready, activeConversationId, setActiveConversationId, sendMessage }),
    [messages, ready, activeConversationId, sendMessage],
  );

  return <ChatStoreContext.Provider value={value}>{children}</ChatStoreContext.Provider>;
}

export function useChatStore() {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error("useChatStore must be used inside <ChatStoreProvider>");
  return store;
}
