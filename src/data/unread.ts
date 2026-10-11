// Read state for the simulated chat.
//
// Unread counts are always calculated from the messages: a message is unread for a viewer
// when someone else sent it after the point the viewer has read up to in that conversation.
// The viewer's own messages never count. This module has no React code, so the rules can be
// tested on their own and the interface can change without touching them.
//
// Kept in memory only, like the demo messages (D-024, D-030).

import type { ChatMessage } from "./types";

/** For each viewer, the time (ISO 8601) up to which they have read each conversation. */
export type ReadState = Record<string, Record<string, string>>;

const time = (iso: string) => Date.parse(iso);

function inConversation(messages: ChatMessage[], conversationId: string) {
  return messages.filter((m) => m.conversationId === conversationId);
}

/**
 * The point a viewer has read a conversation up to: the explicit read state if there is one,
 * otherwise their own latest message in it (replying means they had read what came before).
 * Returns null when the viewer has never read or written in the conversation.
 */
export function readUpTo(
  state: ReadState,
  messages: ChatMessage[],
  viewerId: string,
  conversationId: string,
): string | null {
  const explicit = state[viewerId]?.[conversationId];
  const own = inConversation(messages, conversationId)
    .filter((m) => m.senderId === viewerId)
    .map((m) => m.sentAt)
    .sort((a, b) => time(a) - time(b))
    .at(-1);
  if (explicit && own) return time(explicit) >= time(own) ? explicit : own;
  return explicit ?? own ?? null;
}

/** Messages from other people that the viewer has not read yet. */
export function unreadCount(state: ReadState, messages: ChatMessage[], viewerId: string, conversationId: string) {
  const upTo = readUpTo(state, messages, viewerId, conversationId);
  return inConversation(messages, conversationId).filter(
    (m) => m.senderId !== viewerId && (upTo === null || time(m.sentAt) > time(upTo)),
  ).length;
}

/** Sum of unread messages over several conversations. */
export function totalUnread(state: ReadState, messages: ChatMessage[], viewerId: string, conversationIds: string[]) {
  return conversationIds.reduce((n, id) => n + unreadCount(state, messages, viewerId, id), 0);
}

/** A new read state where the viewer has read everything currently in the conversation. */
export function markRead(state: ReadState, messages: ChatMessage[], viewerId: string, conversationId: string): ReadState {
  const latest = inConversation(messages, conversationId)
    .map((m) => m.sentAt)
    .sort((a, b) => time(a) - time(b))
    .at(-1);
  if (!latest) return state;
  const current = state[viewerId]?.[conversationId];
  if (current && time(current) >= time(latest)) return state;
  return { ...state, [viewerId]: { ...state[viewerId], [conversationId]: latest } };
}
