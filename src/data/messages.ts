// Announcements and chat of the active demo scenario (D-053). The seeds live in
// src/data/scenarios/; only src/data/scenario.ts changes these bindings.
import type { Announcement, ChatMessage, Conversation } from "./types";
import type { ReadState } from "./unread";
import { coach, coachRole, groupById, groupIdsOf, groupName, memberCount, participantById } from "./groups";
import { tennis } from "./scenarios/tennis";
import { COACH_SENDER_ID, type ScenarioData } from "./scenarios/types";

export { COACH_SENDER_ID };

/** Seed announcements for the demo store (src/data/store.tsx). */
export let seedAnnouncements: Announcement[] = tennis.announcements;

export let conversations: Conversation[] = tennis.conversations;

export let seedChatMessages: ChatMessage[] = tennis.chatMessages;

/**
 * Where each demo user had read up to when the demo starts (D-030).
 * Anything not listed is read up to that user's own latest message in the conversation,
 * so the coach starts with the replies that came after their last answer as unread.
 */
export let seedReadState: ReadState = tennis.readState;

/** Points the bindings above at another scenario. Called by src/data/scenario.ts only. */
export function setMessageData(data: ScenarioData) {
  seedAnnouncements = data.announcements;
  conversations = data.conversations;
  seedChatMessages = data.chatMessages;
  seedReadState = data.readState;
}

/** "All groups" or the group's name. */
export function announcementAudience(a: Announcement) {
  return a.groupId ? groupName(a.groupId) : "All groups";
}

/** Announcements relevant to one or several groups (their own and those for all groups), newest first. */
export function announcementsFor(list: Announcement[], groupId?: string | string[]) {
  const ids = groupId === undefined ? undefined : Array.isArray(groupId) ? groupId : [groupId];
  return list
    .filter((a) => !ids || a.groupId === null || ids.includes(a.groupId))
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
}

// ---------------------------------------------------------------------------
// Chat (simulated).

/** The group chat of a group. */
export function groupConversationId(groupId: string) {
  return conversations.find((c) => c.kind === "group" && c.groupId === groupId)?.id;
}

export function conversationById(id: string) {
  return conversations.find((c) => c.id === id);
}

/** The group a conversation belongs to: the group itself, or the participant's group. */
export function conversationGroupId(c: Conversation) {
  return c.kind === "group" ? c.groupId : (participantById(c.participantId)?.groupId ?? "");
}

/** Conversations a demo user can see: all for the coach; their groups and own chat for a participant. */
export function conversationsFor(viewerId: string) {
  if (viewerId === COACH_SENDER_ID) return conversations;
  const groupIds = groupIdsOf(viewerId);
  return conversations.filter((c) => (c.kind === "group" ? groupIds.includes(c.groupId) : c.participantId === viewerId));
}

/** The conversation's name for whoever is viewing it. */
export function conversationTitle(c: Conversation, viewerId = COACH_SENDER_ID) {
  if (c.kind === "group") return groupById(c.groupId)?.name ?? "Group";
  if (viewerId !== COACH_SENDER_ID) return coach.name;
  return participantById(c.participantId)?.name ?? "Participant";
}

/** Short description under the title, e.g. "Group chat · 10 participants". */
export function conversationSubtitle(c: Conversation, viewerId = COACH_SENDER_ID) {
  if (c.kind === "group") return `Group chat · ${memberCount(c.groupId)} participants`;
  if (viewerId !== COACH_SENDER_ID) return `One-to-one · Your ${coachRole().toLowerCase()}, ${coach.organisation}`;
  const p = participantById(c.participantId);
  const group = groupById(p?.groupId ?? "");
  return ["One-to-one", group?.name, p?.detail].filter(Boolean).join(" · ");
}

export function senderName(senderId: string) {
  return senderId === COACH_SENDER_ID ? coach.name : (participantById(senderId)?.name ?? "Unknown");
}

/** Messages of one conversation, oldest first. */
export function messagesOf(messages: ChatMessage[], conversationId: string) {
  return messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt));
}

export function lastMessageOf(messages: ChatMessage[], conversationId: string) {
  return messagesOf(messages, conversationId).at(-1);
}
