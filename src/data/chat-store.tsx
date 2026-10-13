"use client";

// Chat demo store.
// Holds the chat messages and what each demo user has read. Messages sent in the demo are never
// delivered to anyone (D-024, D-030). Since D-060 the messages typed in this browser and the read
// state are kept in this browser, per scenario, so they survive a reload; "Reset demo data"
// removes them. In a later phase, `sendMessage` and `markConversationRead` are the boundary to
// replace with a real messaging backend.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "./types";
import { COACH_SENDER_ID, seedChatMessages, seedReadState } from "./messages";
import { markRead, totalUnread, unreadCount, type ReadState } from "./unread";
import { newId } from "./store";
import { activeScenarioId } from "./scenario";
import { loadChatState, saveChatState } from "./persistence";

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
  /** Back to the scenario's fictional messages and read state (used by "Reset demo data"). */
  resetChat: () => void;
};

const ChatStoreContext = createContext<ChatStore | null>(null);

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedChatMessages);
  const [ready, setReady] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [readState, setReadState] = useState<ReadState>(seedReadState);

  // The scenario is fixed for the life of this provider: the app is mounted again on a switch (D-053).
  const [scenario] = useState(activeScenarioId);
  // Saved only after the visitor sends or reads something, so an untouched demo stores nothing.
  const dirty = useRef(false);

  useEffect(() => {
    const saved = loadChatState(scenario);
    if (saved) {
      setMessages([...seedChatMessages, ...saved.messages]);
      setReadState(saved.readState);
    }
    setReady(true);
  }, [scenario]);

  useEffect(() => {
    if (!ready || !dirty.current) return;
    saveChatState(scenario, { messages: messages.filter((m) => m.local).map((m) => ({ ...m, local: true as const })), readState });
  }, [ready, scenario, messages, readState]);

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
    dirty.current = true;
    setMessages((prev) => [...prev, message]);
    return true;
  }, []);

  const markConversationRead = useCallback(
    (conversationId: string, viewerId: string) =>
      setReadState((prev) => {
        const next = markRead(prev, messages, viewerId, conversationId);
        if (next !== prev) dirty.current = true;
        return next;
      }),
    [messages],
  );

  const resetChat = useCallback(() => {
    dirty.current = false;
    setMessages(seedChatMessages);
    setReadState(seedReadState);
  }, []);

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
      resetChat,
    }),
    [messages, ready, activeConversationId, sendMessage, markConversationRead, unreadIn, unreadTotal, resetChat],
  );

  return <ChatStoreContext.Provider value={value}>{children}</ChatStoreContext.Provider>;
}

export function useChatStore() {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error("useChatStore must be used inside <ChatStoreProvider>");
  return store;
}
