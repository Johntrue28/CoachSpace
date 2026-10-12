// Coach dashboard figures (src/data/dashboard.ts).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NO_CHANGES } from "@/data/calendar";
import { cancelSession } from "@/data/schedule";
import { participantsOf } from "@/data/groups";
import { attendanceTotals, greetingFor, weekSessionStats } from "@/data/dashboard";
import type { AttendanceRecord } from "@/data/types";

// Wednesday 14 October 2026, 12:00. Week of 12–18 Oct: g1 Mon/Wed, g2 Tue/Thu, g3 Wed/Fri, g4 Tue/Thu = 8 sessions.
const now = new Date(2026, 9, 14, 12, 0);

describe("greeting", () => {
  test("follows the time of day", () => {
    assert.equal(greetingFor(8), "Good morning");
    assert.equal(greetingFor(12), "Good afternoon");
    assert.equal(greetingFor(17), "Good afternoon");
    assert.equal(greetingFor(18), "Good evening");
  });
});

describe("sessions this week", () => {
  test("counts the week's sessions and those still to come", () => {
    // Still to come after Wed 12:00: g1 Wed 18:00, g3 Wed 17:30, g2 Thu, g4 Thu, g3 Fri.
    assert.deepEqual(weekSessionStats(now, NO_CHANGES), { total: 8, remaining: 5 });
  });
  test("leaves out cancelled sessions", () => {
    assert.deepEqual(weekSessionStats(now, cancelSession(NO_CHANGES, "g2-2026-10-15")), { total: 7, remaining: 4 });
  });
  test("can be limited to some groups", () => {
    assert.deepEqual(weekSessionStats(now, NO_CHANGES, ["g1"]), { total: 2, remaining: 1 });
  });
});

describe("attendance totals", () => {
  const all = (groupId: string, sessionId: string, absentCount: number): AttendanceRecord => {
    const members = participantsOf(groupId);
    return {
      sessionId,
      groupId,
      savedAt: "",
      marks: Object.fromEntries(members.map((p, i) => [p.id, i < absentCount ? "absent" : "present"])),
    };
  };
  test("nothing marked yet gives no percentage", () => {
    assert.deepEqual(attendanceTotals([]), { sessions: 0, present: 0, absent: 0, rate: null });
  });
  test("adds up every saved session and rounds the share present", () => {
    // U12 Football has 10 participants: 8 + 9 present of 20 marks = 85%.
    const totals = attendanceTotals([all("g1", "g1-2026-10-12", 2), all("g1", "g1-2026-10-07", 1)]);
    assert.deepEqual(totals, { sessions: 2, present: 17, absent: 3, rate: 85 });
  });
});
