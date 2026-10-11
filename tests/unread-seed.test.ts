// Unread counts on the real demo data (complements unread.test.ts).
import { test } from "node:test";
import assert from "node:assert/strict";
import { COACH_SENDER_ID, conversationsFor, seedChatMessages, seedReadState } from "@/data/messages";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";
import { markRead, totalUnread, unreadCount } from "@/data/unread";

test("the coach starts with 4 unread messages, derived from the demo messages", () => {
  const ids = conversationsFor(COACH_SENDER_ID).map((c) => c.id);
  assert.equal(totalUnread(seedReadState, seedChatMessages, COACH_SENDER_ID, ids), 4);
  assert.equal(unreadCount(seedReadState, seedChatMessages, COACH_SENDER_ID, "c-g1"), 1);
});
test("the demo participant starts with 3 unread messages in his own chats", () => {
  const ids = conversationsFor(DEMO_PARTICIPANT_ID).map((c) => c.id);
  assert.equal(totalUnread(seedReadState, seedChatMessages, DEMO_PARTICIPANT_ID, ids), 3);
});
test("reading every conversation brings the coach to zero", () => {
  const ids = conversationsFor(COACH_SENDER_ID).map((c) => c.id);
  const state = ids.reduce((s, id) => markRead(s, seedChatMessages, COACH_SENDER_ID, id), seedReadState);
  assert.equal(totalUnread(state, seedChatMessages, COACH_SENDER_ID, ids), 0);
});
