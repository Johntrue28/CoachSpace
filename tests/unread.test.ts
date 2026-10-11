// Unit tests for the chat read state (src/data/unread.ts). Run with `npm test`.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { markRead, readUpTo, totalUnread, unreadCount, type ReadState } from "../src/data/unread.ts";
import type { ChatMessage } from "../src/data/types.ts";

const COACH = "coach";
let n = 0;
const msg = (conversationId: string, senderId: string, sentAt: string): ChatMessage => ({
  id: `m${++n}`,
  conversationId,
  senderId,
  body: "…",
  sentAt,
});

// Group chat: two messages, the coach replies, then two more messages from participants.
const group = [
  msg("g", "p1", "2026-10-09T17:00:00Z"),
  msg("g", "p2", "2026-10-09T17:05:00Z"),
  msg("g", COACH, "2026-10-09T17:10:00Z"),
  msg("g", "p1", "2026-10-10T09:00:00Z"),
  msg("g", "p3", "2026-10-10T09:30:00Z"),
];
// One-to-one chat where the coach has never written.
const direct = [msg("d", "p1", "2026-10-10T10:00:00Z"), msg("d", "p1", "2026-10-10T10:01:00Z")];
// Conversation where the coach wrote last.
const replied = [msg("r", "p2", "2026-10-10T11:00:00Z"), msg("r", COACH, "2026-10-10T11:05:00Z")];
const all = [...group, ...direct, ...replied];
const empty: ReadState = {};

describe("unread count", () => {
  test("counts other people's messages after the viewer's last own message", () => {
    assert.equal(unreadCount(empty, all, COACH, "g"), 2);
  });
  test("counts everything from others when the viewer never read or wrote", () => {
    assert.equal(unreadCount(empty, all, COACH, "d"), 2);
  });
  test("is zero when the viewer wrote the latest message", () => {
    assert.equal(unreadCount(empty, all, COACH, "r"), 0);
  });
  test("is zero for an empty or unknown conversation", () => {
    assert.equal(unreadCount(empty, all, COACH, "nope"), 0);
  });
  test("total adds up the conversations", () => {
    assert.equal(totalUnread(empty, all, COACH, ["g", "d", "r", "nope"]), 4);
  });
  test("an explicit read point is used when it is later than the viewer's own message", () => {
    const state: ReadState = { [COACH]: { g: "2026-10-10T09:00:00Z" } };
    assert.equal(unreadCount(state, all, COACH, "g"), 1);
  });
  test("the viewer's own later message wins over an older explicit read point", () => {
    const state: ReadState = { [COACH]: { r: "2026-10-10T10:00:00Z" } };
    assert.equal(readUpTo(state, all, COACH, "r"), "2026-10-10T11:05:00Z");
    assert.equal(unreadCount(state, all, COACH, "r"), 0);
  });
  test("counts are per viewer", () => {
    // p1 wrote the latest message in "d" and p3 the latest in "g".
    assert.equal(unreadCount(empty, all, "p1", "d"), 0);
    assert.equal(unreadCount(empty, all, "p3", "g"), 0);
    assert.equal(unreadCount(empty, all, "p2", "g"), 3);
  });
});

describe("own messages", () => {
  test("a message the viewer sends never becomes unread for them", () => {
    const withOwn = [...all, msg("d", COACH, "2026-10-10T12:00:00Z")];
    assert.equal(unreadCount(empty, withOwn, COACH, "d"), 0);
  });
  test("an own message does not change other viewers' counts beyond adding one unread", () => {
    const withOwn = [...all, msg("g", COACH, "2026-10-10T12:00:00Z")];
    assert.equal(unreadCount(empty, withOwn, COACH, "g"), 0);
    assert.equal(unreadCount(empty, withOwn, "p2", "g"), 4);
  });
});

describe("mark as read", () => {
  test("opening a conversation makes its count zero", () => {
    const state = markRead(empty, all, COACH, "g");
    assert.equal(unreadCount(state, all, COACH, "g"), 0);
  });
  test("only the opened conversation and viewer change", () => {
    const state = markRead(empty, all, COACH, "g");
    assert.equal(unreadCount(state, all, COACH, "d"), 2);
    assert.equal(unreadCount(state, all, "p2", "g"), 3);
  });
  test("does not change the state when there is nothing new", () => {
    const once = markRead(empty, all, COACH, "g");
    assert.equal(markRead(once, all, COACH, "g"), once);
    assert.equal(markRead(empty, all, COACH, "nope"), empty);
  });
  test("returns a new object and leaves the previous state untouched", () => {
    const before: ReadState = { p9: { x: "2026-01-01T00:00:00Z" } };
    const after = markRead(before, all, COACH, "d");
    assert.notEqual(after, before);
    assert.deepEqual(before, { p9: { x: "2026-01-01T00:00:00Z" } });
    assert.equal(after.p9.x, "2026-01-01T00:00:00Z");
  });
});

describe("navigating between conversations", () => {
  test("reading one conversation after another keeps both read and the rest unread", () => {
    let state = markRead(empty, all, COACH, "g");
    assert.equal(totalUnread(state, all, COACH, ["g", "d", "r"]), 2);
    state = markRead(state, all, COACH, "d");
    assert.equal(totalUnread(state, all, COACH, ["g", "d", "r"]), 0);
    // Going back to the first one changes nothing.
    assert.equal(markRead(state, all, COACH, "g"), state);
  });
  test("a message that arrives after reading is unread again", () => {
    const state = markRead(empty, all, COACH, "g");
    const later = [...all, msg("g", "p2", "2026-10-11T08:00:00Z")];
    assert.equal(unreadCount(state, later, COACH, "g"), 1);
  });
});
