// "Activity in this demo" (src/data/activity.ts): what the bell panel lists.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NO_CHANGES } from "@/data/calendar";
import { cancelSession, createOneOff, updateSession } from "@/data/schedule";
import { buildActivity, changedSessions, sessionsWithoutAttendance } from "@/data/activity";
import type { AttendanceRecord } from "@/data/types";

// Wednesday 14 October 2026, 12:00 local time. Weekly slots: g1 Mon/Wed 18:00, g2 Tue/Thu 19:30,
// g3 Wed/Fri 17:30, g4 Tue/Thu 08:30.
const now = new Date(2026, 9, 14, 12, 0);
const record = (sessionId: string, groupId: string): AttendanceRecord => ({ sessionId, groupId, marks: {}, savedAt: "" });

function demoChanges() {
  let c = updateSession(NO_CHANGES, "g1-2026-10-19", { date: "2026-10-20", time: "19:00" });
  c = cancelSession(c, "g2-2026-10-15");
  c = createOneOff(c, { groupId: "g1", title: "Friendly match", date: "2026-10-17", time: "10:00", durationMin: 90, place: "Pitch 1" }, "oo-1").changes;
  c = updateSession(c, "g3-2026-10-16", { place: "Court 1" });
  c = updateSession(c, "g4-2026-10-15", { title: "Balance and breathing" });
  c = cancelSession(c, "g1-2026-10-12"); // in the past: not listed
  return c;
}

describe("sessions without attendance", () => {
  test("lists started sessions of the last week per group, most recent first", () => {
    assert.deepEqual(sessionsWithoutAttendance(now, NO_CHANGES, []), [
      { groupId: "g2", sessionIds: ["g2-2026-10-13", "g2-2026-10-08"] },
      { groupId: "g4", sessionIds: ["g4-2026-10-13", "g4-2026-10-08"] },
      { groupId: "g1", sessionIds: ["g1-2026-10-12", "g1-2026-10-07"] },
      { groupId: "g3", sessionIds: ["g3-2026-10-09", "g3-2026-10-07"] },
    ]);
  });
  test("leaves out sessions with attendance saved and cancelled sessions", () => {
    const changes = cancelSession(NO_CHANGES, "g3-2026-10-09");
    const result = sessionsWithoutAttendance(now, changes, [record("g1-2026-10-12", "g1"), record("g1-2026-10-07", "g1")]);
    assert.equal(result.find((g) => g.groupId === "g1"), undefined);
    assert.deepEqual(result.find((g) => g.groupId === "g3")?.sessionIds, ["g3-2026-10-07"]);
  });
});

describe("changed sessions", () => {
  test("lists upcoming changes with their kind, soonest first", () => {
    const list = changedSessions(now, demoChanges()).map((c) => [c.session.id, c.session.date, c.change]);
    assert.deepEqual(list, [
      ["g4-2026-10-15", "2026-10-15", "updated"],
      ["g2-2026-10-15", "2026-10-15", "cancelled"],
      ["g3-2026-10-16", "2026-10-16", "place"],
      ["oo-1", "2026-10-17", "added"],
      ["g1-2026-10-19", "2026-10-20", "moved"],
    ]);
  });
  test("can be limited to the viewer's groups", () => {
    const list = changedSessions(now, demoChanges(), { groupIds: ["g2", "g4"] }).map((c) => c.session.id);
    assert.deepEqual(list, ["g4-2026-10-15", "g2-2026-10-15"]);
  });
  test("nothing is listed without changes", () => {
    assert.deepEqual(changedSessions(now, NO_CHANGES), []);
  });
});

describe("activity list", () => {
  const unread = [
    { conversationId: "c-g1", count: 2 },
    { conversationId: "c-g2", count: 0 },
  ];
  test("unread conversations first, then attendance, then session changes", () => {
    const items = buildActivity({ now, unread, changes: demoChanges(), attendance: [], includeAttendance: true });
    assert.deepEqual(items.map((i) => i.kind), ["unread", "attendance", "attendance", "attendance", "attendance", "session", "session", "session", "session", "session"]);
    assert.deepEqual(items[0], { kind: "unread", conversationId: "c-g1", count: 2 });
  });
  test("the participant view never lists attendance and only shows their groups", () => {
    const items = buildActivity({ now, unread, changes: demoChanges(), attendance: [], includeAttendance: false, groupIds: ["g2"] });
    assert.deepEqual(items.map((i) => (i.kind === "session" ? i.session.id : i.kind)), ["unread", "g2-2026-10-15"]);
  });
});
