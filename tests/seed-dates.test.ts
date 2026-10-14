// Seed dates (audit R-03): seeded content is moved to the visitor's week, so the demo does not go
// out of date. Checked for all four scenarios with a future clock (10 November 2026, the date the
// audit used to show the problem) and further ahead.
import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";
import { pilates } from "@/data/scenarios/pilates";
import type { ScenarioData } from "@/data/scenarios/types";
import { COACH_SENDER_ID } from "@/data/scenarios/types";
import { SEED_WEEK, datedScenario, seedWeekOffset, shiftSessionId, shiftTimestamp } from "@/data/seed-dates";
import { applyScenario } from "@/data/scenario";
import * as messageData from "@/data/messages";
import { regularSession, sessionsOn, toDateKey, weekStart } from "@/data/calendar";
import { unreadCount } from "@/data/unread";
import { formatListStamp, formatPosted } from "@/components/format";

const scenarios: ScenarioData[] = [tennis, football, basketball, pilates];
const NOV_10 = new Date(2026, 10, 10, 12, 0); // Tuesday 10 November 2026, 12:00 local time
const DAY = 86_400_000;
const MONTHS = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/;

afterEach(() => applyScenario(tennis));

/** Every seeded date and time of a scenario, with where it comes from. */
function timestamps(s: ScenarioData) {
  return [
    ...s.announcements.map((a) => ({ where: `announcement ${a.id}`, at: a.postedAt })),
    ...s.chatMessages.map((m) => ({ where: `message ${m.id}`, at: m.sentAt })),
    ...Object.entries(s.readState).flatMap(([viewer, cs]) => Object.entries(cs).map(([id, at]) => ({ where: `read ${viewer}/${id}`, at }))),
    ...s.plans.map((p) => ({ where: `plan ${p.id}`, at: p.updatedAt })),
    ...s.notes.map((n) => ({ where: `note ${n.sessionId}`, at: n.savedAt })),
    ...s.assignments.map((a) => ({ where: `assignment ${a.id}`, at: `${a.assignedOn}T12:00:00` })),
  ];
}

describe("seed week offset", () => {
  test("whole weeks from the week of Monday 12 October 2026, by local date", () => {
    assert.equal(SEED_WEEK, "2026-10-12");
    assert.equal(seedWeekOffset(new Date(2026, 9, 12, 0, 1)), 0);
    assert.equal(seedWeekOffset(new Date(2026, 9, 14, 12, 0)), 0);
    assert.equal(seedWeekOffset(new Date(2026, 9, 18, 23, 59)), 0, "Sunday is still the seed week");
    assert.equal(seedWeekOffset(new Date(2026, 9, 19, 0, 0)), 1);
    assert.equal(seedWeekOffset(NOV_10), 4);
    assert.equal(seedWeekOffset(new Date(2027, 2, 3, 9, 0)), 20, "across the new year");
  });

  test("timestamps keep their local time across a change from summer time", () => {
    const shifted = new Date(shiftTimestamp("2026-10-09T17:40:00+02:00", 4));
    const original = new Date("2026-10-09T17:40:00+02:00");
    assert.equal(shifted.getHours(), original.getHours());
    assert.equal(shifted.getMinutes(), original.getMinutes());
    assert.equal(shifted.getDay(), original.getDay(), "same weekday");
    assert.equal(toDateKey(shifted), toDateKey(new Date(original.getFullYear(), original.getMonth(), original.getDate() + 28)));
    assert.equal(shiftTimestamp("2026-10-09T17:40:00+02:00", 0), "2026-10-09T17:40:00+02:00");
  });

  test("recurring session ids move with their date; other ids are kept", () => {
    assert.equal(shiftSessionId("g1-2026-10-07", 4), "g1-2026-11-04");
    assert.equal(shiftSessionId("oo-123", 4), "oo-123");
    assert.equal(shiftSessionId("g1-2026-10-07", 0), "g1-2026-10-07");
  });
});

for (const seed of scenarios) {
  describe(`${seed.id}: seed dates on 10 November 2026`, () => {
    test("the seed itself is never modified, and the result is the same on every call", () => {
      const before = structuredClone(seed);
      const a = datedScenario(seed, NOV_10);
      const b = datedScenario(seed, NOV_10);
      assert.deepEqual(seed, before);
      assert.deepEqual(a, b);
      assert.equal(datedScenario(seed, new Date(2026, 9, 14, 12, 0)), seed, "the seed week uses the seed as it is");
    });

    test("no seeded date is left in October, and none is in the future", () => {
      const dated = datedScenario(seed, NOV_10);
      for (const { where, at } of timestamps(dated)) {
        const t = new Date(at);
        assert.ok(t.getMonth() !== 9, `${where} is not in October (${at})`);
        assert.ok(t.getTime() <= NOV_10.getTime(), `${where} is not in the future (${at})`);
        assert.ok(NOV_10.getTime() - t.getTime() < 21 * DAY, `${where} is less than three weeks old (${at})`);
      }
    });

    test("content keeps believable ages: not everything from today", () => {
      const dated = datedScenario(seed, NOV_10);
      const today = toDateKey(NOV_10);
      const days = new Set(dated.chatMessages.map((m) => toDateKey(new Date(m.sentAt))));
      assert.ok(days.size >= 3, `messages spread over several days (${[...days].join(", ")})`);
      assert.ok(!days.has(today), "no seeded message pretends to be from today");
    });

    test("order, weekdays and unread messages are preserved", () => {
      const dated = datedScenario(seed, NOV_10);
      const order = (s: ScenarioData) => [...s.chatMessages].sort((x, y) => Date.parse(x.sentAt) - Date.parse(y.sentAt)).map((m) => m.id);
      assert.deepEqual(order(dated), order(seed));
      dated.chatMessages.forEach((m, i) => assert.equal(new Date(m.sentAt).getDay(), new Date(seed.chatMessages[i].sentAt).getDay(), `${m.id} same weekday`));
      for (const c of seed.conversations) {
        assert.equal(
          unreadCount(dated.readState, dated.chatMessages, COACH_SENDER_ID, c.id),
          unreadCount(seed.readState, seed.chatMessages, COACH_SENDER_ID, c.id),
          `${c.id}: same unread count for the coach`,
        );
      }
    });

    test("session topics still match the messages: the seed week's topics fall on the same weekdays", () => {
      const weeks = seedWeekOffset(NOV_10);
      applyScenario(seed);
      const seedWeek = [0, 1, 2, 3, 4, 5, 6].flatMap((i) => sessionsOn(new Date(Date.UTC(2026, 9, 12 + i)).toISOString().slice(0, 10)));
      applyScenario(seed, NOV_10);
      const thisWeek = [0, 1, 2, 3, 4, 5, 6].flatMap((i) => sessionsOn(new Date(Date.UTC(2026, 9, 12 + i + weeks * 7)).toISOString().slice(0, 10)));
      assert.deepEqual(thisWeek.map((s) => s.title), seedWeek.map((s) => s.title));
      assert.ok(thisWeek.length > 0);
    });

    test("the note from last time belongs to a real, past session", () => {
      applyScenario(seed, NOV_10);
      const dated = datedScenario(seed, NOV_10);
      assert.ok(dated.notes.length > 0);
      for (const n of dated.notes) {
        assert.ok(regularSession(n.sessionId), `${n.sessionId} is a session of the weekly schedule`);
        assert.ok(n.sessionId.slice(-10) < weekStart(toDateKey(NOV_10)), `${n.sessionId} is from last week`);
      }
    });

    test("seeded text names no month, so it cannot go out of date", () => {
      const texts = [
        ...seed.announcements.flatMap((a) => [a.title, a.body]),
        ...seed.chatMessages.map((m) => m.body),
        ...seed.assignments.map((a) => a.customInstructions),
        ...seed.notes.flatMap((n) => [n.worked, n.improve, n.revisit]),
      ];
      for (const t of texts) assert.doesNotMatch(t, MONTHS, `"${t}"`);
    });

    test("applied in the browser, the dashboard's latest message is not shown as an October date", () => {
      applyScenario(seed, NOV_10);
      const latest = [...messageData.seedChatMessages].sort((x, y) => Date.parse(y.sentAt) - Date.parse(x.sentAt))[0];
      assert.doesNotMatch(formatListStamp(latest.sentAt, NOV_10), /Oct/);
      for (const a of messageData.seedAnnouncements) assert.doesNotMatch(formatPosted(a.postedAt, NOV_10), /Oct/);
    });
  });
}

test("months later the content is still recent (3 March 2027)", () => {
  const march = new Date(2027, 2, 3, 9, 0);
  for (const seed of scenarios) {
    for (const { where, at } of timestamps(datedScenario(seed, march))) {
      const age = march.getTime() - new Date(at).getTime();
      assert.ok(age >= 0 && age < 21 * DAY, `${seed.id} ${where}: ${at}`);
    }
  }
});
