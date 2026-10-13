import { test } from "node:test";
import assert from "node:assert/strict";
import { chatStorageKey, parseSavedChat, storageKey } from "@/data/persistence";

// D-060: the demo chat is saved per scenario and read back safely.
const good = {
  scenario: "football",
  messages: [{ id: "msg-1", conversationId: "c-g1", senderId: "coach", body: "Bring shin pads.", sentAt: "2026-10-14T10:00:00.000Z", local: true }],
  readState: { coach: { "c-g1": "2026-10-14T10:00:00.000Z" } },
};

test("a saved chat is read back for its own scenario only", () => {
  assert.equal(chatStorageKey("football"), `${storageKey("football")}:chat`);
  const parsed = parseSavedChat(JSON.stringify(good), "football");
  assert.deepEqual(parsed, { messages: good.messages, readState: good.readState });
  assert.equal(parseSavedChat(JSON.stringify(good), "tennis"), null, "never shown in another scenario");
});

test("corrupt or partial saves are ignored rather than shown", () => {
  assert.equal(parseSavedChat(null, "football"), null);
  assert.equal(parseSavedChat("{not json", "football"), null);
  assert.equal(parseSavedChat(JSON.stringify({ scenario: "football", messages: "x", readState: {} }), "football"), null);
  const mixed = {
    ...good,
    messages: [...good.messages, { id: 2, body: "no" }, { id: "m3", conversationId: "c", senderId: "coach", body: "x", sentAt: "not a date" }],
    readState: { coach: { "c-g1": "2026-10-14T10:00:00.000Z", bad: 5 }, p12: "nope" },
  };
  const parsed = parseSavedChat(JSON.stringify(mixed), "football")!;
  assert.deepEqual(parsed.messages, good.messages, "only well-formed messages");
  assert.deepEqual(parsed.readState, { coach: { "c-g1": "2026-10-14T10:00:00.000Z" } }, "only well-formed read times");
  // Saved messages are always marked as typed in this browser (never presented as delivered).
  const unmarked = { ...good, messages: [{ ...good.messages[0], local: false }] };
  assert.equal(parseSavedChat(JSON.stringify(unmarked), "football")!.messages[0].local, true);
});
