// Attendance: the right participants for the right group and session.
import "./fixtures/use-harbour"; // the original mixed-sport data these rules were written against
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { attendanceCandidates, rosterFor, sessionMatchesGroup, sessionsWithoutAttendance } from "@/data/attendance";
import type { AttendanceRecord } from "@/data/types";
import { NO_CHANGES, sessionById } from "@/data/calendar";
import { cancelSession } from "@/data/schedule";

describe("roster", () => {
  test("only members of the session's group, each once", () => {
    const roster = rosterFor("g4");
    assert.equal(roster.length, 8);
    assert.equal(new Set(roster.map((p) => p.id)).size, roster.length);
    assert.ok(roster.some((p) => p.id === "p12"), "Jordan is in Morning Fitness");
  });
  test("a participant in two groups is not added to a third group's list", () => {
    assert.ok(rosterFor("g2").some((p) => p.id === "p12"));
    assert.ok(!rosterFor("g1").some((p) => p.id === "p12"));
    assert.ok(!rosterFor("g3").some((p) => p.id === "p12"));
  });
});

describe("session and group", () => {
  test("a session matches its own group only", () => {
    const s = sessionById("g1-2026-10-14")!;
    assert.ok(sessionMatchesGroup(s, "g1"));
    assert.ok(!sessionMatchesGroup(s, "g2"));
    assert.ok(sessionMatchesGroup(s, undefined));
  });
  test("candidates: today's and recent sessions of the group, newest first, without cancelled ones", () => {
    const now = new Date(2026, 9, 14, 19, 0); // Wed 14 Oct, 19:00
    const { today, recent } = attendanceCandidates("g1", now);
    assert.deepEqual(today.map((s) => s.id), ["g1-2026-10-14"]);
    assert.deepEqual(recent.slice(0, 3).map((s) => s.id), ["g1-2026-10-12", "g1-2026-10-07", "g1-2026-10-05"]);
    assert.ok(recent.every((s) => s.groupId === "g1"));
    const changes = cancelSession(NO_CHANGES, "g1-2026-10-12");
    assert.ok(!attendanceCandidates("g1", now, changes).recent.some((s) => s.id === "g1-2026-10-12"));
  });
});

// Wednesday 14 October 2026, 12:00 local time (the fixture's week).
const withoutNow = new Date(2026, 9, 14, 12, 0);
const record = (sessionId: string, groupId: string): AttendanceRecord => ({ sessionId, groupId, marks: {}, savedAt: "" });

describe("sessions without attendance", () => {
  test("lists started sessions of the last week per group, most recent first", () => {
    assert.deepEqual(sessionsWithoutAttendance(withoutNow, NO_CHANGES, []), [
      { groupId: "g2", sessionIds: ["g2-2026-10-13", "g2-2026-10-08"] },
      { groupId: "g4", sessionIds: ["g4-2026-10-13", "g4-2026-10-08"] },
      { groupId: "g1", sessionIds: ["g1-2026-10-12", "g1-2026-10-07"] },
      { groupId: "g3", sessionIds: ["g3-2026-10-09", "g3-2026-10-07"] },
    ]);
  });
  test("leaves out sessions with attendance saved and cancelled sessions", () => {
    const changes = cancelSession(NO_CHANGES, "g3-2026-10-09");
    const result = sessionsWithoutAttendance(withoutNow, changes, [record("g1-2026-10-12", "g1"), record("g1-2026-10-07", "g1")]);
    assert.equal(result.find((g) => g.groupId === "g1"), undefined);
    assert.deepEqual(result.find((g) => g.groupId === "g3")?.sessionIds, ["g3-2026-10-07"]);
  });
});
