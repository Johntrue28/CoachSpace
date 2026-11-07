// "Are you coming?" answers (D-071): seeded answers, changes, summaries and the register defaults.
import "./fixtures/use-harbour";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { sessionById } from "@/data/calendar";
import { rosterFor } from "@/data/attendance";
import {
  answersFor,
  membersByAnswer,
  normaliseReminders,
  normaliseRsvpChanges,
  registerDefaults,
  replyShare,
  seededAnswers,
  setAnswer,
  summarise,
  summaryText,
} from "@/data/rsvp";

const session = sessionById("g1-2026-10-14")!; // Wed 14 Oct, group g1

describe("seeded answers", () => {
  test("the same on every call and only for members of the group", () => {
    const now = new Date(2026, 9, 13, 12, 0);
    const a = seededAnswers(session, now);
    assert.deepEqual(a, seededAnswers(session, now));
    const ids = new Set(rosterFor("g1").map((p) => p.id));
    assert.ok(Object.keys(a).every((id) => ids.has(id)));
  });
  test("more people have replied as the session gets closer", () => {
    assert.ok(replyShare(session, new Date(2026, 9, 1)) < replyShare(session, new Date(2026, 9, 14, 9)));
    assert.equal(replyShare(session, new Date(2026, 9, 20)), 0.95);
  });
  test("the demo participant answers upcoming sessions themselves", () => {
    const fitness = sessionById("g4-2026-10-15") ?? session;
    const self = rosterFor(fitness.groupId)[0].id;
    const before = seededAnswers(fitness, new Date(2026, 9, 15, 6), { selfId: self });
    assert.equal(before[self], undefined);
  });
  test("cancelled sessions have no answers", () => {
    assert.deepEqual(seededAnswers({ ...session, status: "cancelled" }, new Date(2026, 9, 13)), {});
  });
});

describe("changes and summaries", () => {
  const [first, second] = rosterFor("g1");
  test("a change overrides the seed and null removes an answer", () => {
    const seed = { [first.id]: "going" as const, [second.id]: "maybe" as const };
    let changes = setAnswer({}, session.id, first.id, "not-going");
    changes = setAnswer(changes, session.id, second.id, null);
    const answers = answersFor(seed, changes, session);
    assert.equal(answers[first.id], "not-going");
    assert.equal(answers[second.id], undefined);
  });
  test("summary counts add up to the roster", () => {
    const answers = { [first.id]: "going" as const, [second.id]: "not-going" as const };
    const s = summarise(answers, "g1");
    assert.equal(s.going + s.maybe + s.notGoing + s.noReply, rosterFor("g1").length);
    assert.equal(s.going, 1);
    assert.equal(s.notGoing, 1);
    assert.match(summaryText(s), /^1 going · 1 not going · \d+ no reply$/);
  });
  test("members are listed by answer, without empty sections", () => {
    const groups = membersByAnswer({ [first.id]: "going" }, "g1");
    assert.deepEqual(groups.map((g) => g.key), ["going", "none"]);
  });
  test("the register starts absent only for members who said they are not going", () => {
    const marks = registerDefaults({ [first.id]: "not-going", [second.id]: "maybe" }, "g1");
    assert.equal(marks[first.id], "absent");
    assert.equal(marks[second.id], "present");
    assert.equal(Object.keys(marks).length, rosterFor("g1").length);
  });
});

describe("saved data", () => {
  test("malformed answers and reminders are dropped", () => {
    assert.deepEqual(normaliseRsvpChanges({ s1: { p1: "going", p2: "yes", p3: null }, s2: "x", s3: [] }), {
      s1: { p1: "going", p3: null },
    });
    assert.deepEqual(normaliseRsvpChanges("nope"), {});
    assert.deepEqual(normaliseReminders({ s1: "2026-10-14T10:00:00Z", s2: "never", s3: 4 }), { s1: "2026-10-14T10:00:00Z" });
  });
});
