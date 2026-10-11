// Fictional demo data. Will be replaced by a real data source in a later phase.
import type { Announcement, ChatMessage, Conversation } from "./types";
import { coach, groupById, groupIdsOf, groupName, memberCount, participantById } from "./groups";

/** The demo user is always the coach: author of announcements and "you" in the chat. */
export const COACH_SENDER_ID = "coach";

// ---------------------------------------------------------------------------
// Announcements. Seed data for the demo store (src/data/store.tsx).

export const seedAnnouncements: Announcement[] = [
  {
    id: "a1",
    groupId: "g1",
    title: "Friendly match on Saturday",
    body: "Kick-off at 10:00. Please arrive 30 minutes early in your home kit.",
    authorId: COACH_SENDER_ID,
    postedAt: "2026-10-11T13:00:00+02:00",
  },
  {
    id: "a2",
    groupId: "g2",
    title: "Change of venue",
    body: "Thursday's session moves to the main hall.",
    authorId: COACH_SENDER_ID,
    postedAt: "2026-10-10T17:30:00+02:00",
  },
  {
    id: "a3",
    groupId: null,
    title: "Lost property",
    body: "Lost property is kept at reception until the end of the month. Please label kit and water bottles with your name.",
    authorId: COACH_SENDER_ID,
    postedAt: "2026-10-09T12:00:00+02:00",
  },
  {
    id: "a4",
    groupId: "g4",
    title: "Bring a small towel",
    body: "From next week, please bring a small towel to every class for the floor exercises.",
    authorId: COACH_SENDER_ID,
    postedAt: "2026-10-08T09:15:00+02:00",
  },
];

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

export const conversations: Conversation[] = [
  { id: "c-g1", kind: "group", groupId: "g1" },
  { id: "c-g2", kind: "group", groupId: "g2" },
  { id: "c-g3", kind: "group", groupId: "g3" },
  { id: "c-g4", kind: "group", groupId: "g4" },
  // One-to-one chats only with adult participants.
  { id: "c-p11", kind: "direct", participantId: "p11" },
  { id: "c-p29", kind: "direct", participantId: "p29" },
  { id: "c-p31", kind: "direct", participantId: "p31" },
  { id: "c-p12", kind: "direct", participantId: "p12" },
];

const C = COACH_SENDER_ID;

export const seedChatMessages: ChatMessage[] = [
  // U12 Football
  { id: "m01", conversationId: "c-g1", senderId: C, body: "Great effort on Wednesday, everyone. Remember to bring a water bottle to every session.", sentAt: "2026-10-09T17:40:00+02:00" },
  { id: "m02", conversationId: "c-g1", senderId: "p07", body: "Thanks coach! Are we doing shooting practice next time?", sentAt: "2026-10-09T18:02:00+02:00" },
  { id: "m03", conversationId: "c-g1", senderId: C, body: "Next session is all about passing and first touch. Shooting the week after.", sentAt: "2026-10-09T18:10:00+02:00" },
  { id: "m04", conversationId: "c-g1", senderId: "p01", body: "Can I bring my new goalkeeper gloves?", sentAt: "2026-10-10T19:15:00+02:00" },
  { id: "m05", conversationId: "c-g1", senderId: C, body: "Of course, Leo. Bring both pairs in case it rains.", sentAt: "2026-10-10T19:20:00+02:00" },
  { id: "m06", conversationId: "c-g1", senderId: "p04", body: "See you at Pitch 2!", sentAt: "2026-10-11T09:30:00+02:00" },
  // Senior Basketball
  { id: "m07", conversationId: "c-g2", senderId: "p12", body: "Good win last night. My legs are feeling it today.", sentAt: "2026-10-08T21:05:00+02:00" },
  { id: "m08", conversationId: "c-g2", senderId: C, body: "Well played, all of you. Light stretching tomorrow and plenty of sleep.", sentAt: "2026-10-08T21:12:00+02:00" },
  { id: "m09", conversationId: "c-g2", senderId: "p15", body: "Is Thursday still at the usual time?", sentAt: "2026-10-10T12:30:00+02:00" },
  { id: "m10", conversationId: "c-g2", senderId: C, body: "Yes, 19:30. We'll work on pick-and-roll defence.", sentAt: "2026-10-10T12:41:00+02:00" },
  { id: "m11", conversationId: "c-g2", senderId: "p11", body: "I'll bring the spare bibs.", sentAt: "2026-10-10T12:45:00+02:00" },
  // Junior Tennis
  { id: "m12", conversationId: "c-g3", senderId: C, body: "This week we're focusing on the serve. Practise your ball toss at home if you can.", sentAt: "2026-10-09T16:00:00+02:00" },
  { id: "m13", conversationId: "c-g3", senderId: "p21", body: "Should we bring our own balls?", sentAt: "2026-10-09T16:20:00+02:00" },
  { id: "m14", conversationId: "c-g3", senderId: C, body: "No need, the club provides them.", sentAt: "2026-10-09T16:25:00+02:00" },
  { id: "m15", conversationId: "c-g3", senderId: "p20", body: "The grip on my racket is coming off. Is that a problem?", sentAt: "2026-10-10T10:05:00+02:00" },
  { id: "m16", conversationId: "c-g3", senderId: C, body: "Bring it on Wednesday and we'll fit a new grip before the session.", sentAt: "2026-10-10T10:30:00+02:00" },
  // Morning Pilates
  { id: "m17", conversationId: "c-g4", senderId: C, body: "Reminder: bring your own mat if you have one. Spare mats are available in Studio A.", sentAt: "2026-10-10T08:00:00+02:00" },
  { id: "m18", conversationId: "c-g4", senderId: "p26", body: "Will do, thanks Laura!", sentAt: "2026-10-10T08:20:00+02:00" },
  { id: "m19", conversationId: "c-g4", senderId: "p25", body: "Is the class suitable for someone with a stiff lower back?", sentAt: "2026-10-11T08:50:00+02:00" },
  { id: "m20", conversationId: "c-g4", senderId: C, body: "Yes, I'll show you some modifications. Tell me how it feels as we go.", sentAt: "2026-10-11T09:05:00+02:00" },
  // Marcus Reid (one-to-one)
  { id: "m21", conversationId: "c-p11", senderId: "p11", body: "Hi Laura, I might be 10 minutes late on Thursday because of work.", sentAt: "2026-10-09T20:10:00+02:00" },
  { id: "m22", conversationId: "c-p11", senderId: C, body: "No problem, Marcus. Warm up on your own when you arrive.", sentAt: "2026-10-09T20:25:00+02:00" },
  { id: "m23", conversationId: "c-p11", senderId: "p11", body: "Thanks!", sentAt: "2026-10-09T20:26:00+02:00" },
  // Diana Cruz (one-to-one)
  { id: "m24", conversationId: "c-p29", senderId: "p29", body: "Hi Laura, I've been told I can start with gentle exercises again.", sentAt: "2026-10-10T18:00:00+02:00" },
  { id: "m25", conversationId: "c-p29", senderId: C, body: "That's great news, Diana. We'll take it slowly and adapt the exercises for you.", sentAt: "2026-10-10T18:30:00+02:00" },
  // Nina Patel (one-to-one): no messages yet, shows the empty state.
  // Jordan Hale (one-to-one): the demo participant.
  { id: "m26", conversationId: "c-p12", senderId: C, body: "Hi Jordan, I've added The Hundred to your basketball routine. Do it before Thursday's session.", sentAt: "2026-10-10T11:00:00+02:00" },
  { id: "m27", conversationId: "c-p12", senderId: "p12", body: "Thanks Laura, I'll try it on Tuesday in Pilates first.", sentAt: "2026-10-10T11:20:00+02:00" },
];

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
  if (viewerId !== COACH_SENDER_ID) return `One-to-one · Your coach, ${coach.organisation}`;
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
