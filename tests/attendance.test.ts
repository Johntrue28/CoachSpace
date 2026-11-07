// Attendance: the right participants for the right group and session.
import "./fixtures/use-harbour"; // the original mixed-sport data these rules were written against
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { attendanceCandidates, attendanceLog, groupAttendanceRate, mostMissed, rosterFor, sessionMatchesGroup, sessionsWithoutAttendance } from "@/data/attendance";
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

describe("attendance log and overview (D-076)", () => {
  const rec = (sessionId: string, groupId: string, marks: Record<string, "present" | "absent">): AttendanceRecord => ({ sessionId, groupId, marks, savedAt: "2026-10-01T10:00:00Z" });
  const records = [
    rec("g1-2026-10-05", "g1", { a: "present", b: "absent", c: "present" }),
    rec("g1-2026-10-12", "g1", { a: "present", b: "absent", c: "absent" }),
    rec("g2-2026-10-13", "g2", { x: "present" }),
    rec("oo-1", "g1", { a: "present", b: "present", c: "present" }),
  ];
  const dateOf = (id: string) => /(\d{4}-\d{2}-\d{2})$/.exec(id)?.[1];
  test("rows newest first, with present out of everyone marked, for the chosen groups", () => {
    assert.deepEqual(
      attendanceLog(records, ["g1"], dateOf).map((r) => [r.sessionId, r.date, r.present, r.total]),
      [
        ["g1-2026-10-12", "2026-10-12", 1, 3],
        ["g1-2026-10-05", "2026-10-05", 2, 3],
        ["oo-1", "2026-10-01", 3, 3],
      ],
    );
    assert.equal(attendanceLog(records, ["g1", "g2"], dateOf)[0].groupId, "g2");
    assert.deepEqual(attendanceLog(records, [], dateOf), []);
  });
  test("season average of a group", () => {
    assert.equal(groupAttendanceRate(records, "g1"), 67);
    assert.equal(groupAttendanceRate(records, "g3"), null);
  });
  test("players who missed most, lowest attendance first", () => {
    const members = [{ id: "a", name: "Ana" }, { id: "b", name: "Ben" }, { id: "c", name: "Cleo" }];
    assert.deepEqual(mostMissed(records, "g1", members).map((p) => [p.name, p.rate, p.missed]), [["Ben", 33, 2], ["Cleo", 67, 1]]);
    assert.deepEqual(mostMissed(records, "g1", members, 1).map((p) => p.name), ["Ben"]);
  });
});
