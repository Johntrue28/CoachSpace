// Month calendar: grid, navigation and sessions on dates.
import "./fixtures/use-harbour"; // the original mixed-sport data these rules were written against
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NO_CHANGES, addMonths, isMonthKey, monthGrid, monthOf, sessionsOn } from "@/data/calendar";
import { cancelSession, createOneOff, updateSession } from "@/data/schedule";

describe("month grid", () => {
  test("October 2026 starts on a Thursday and has five Monday-to-Sunday weeks", () => {
    const weeks = monthGrid("2026-10");
    assert.equal(weeks.length, 5);
    assert.equal(weeks[0][0], "2026-09-28");
    assert.equal(weeks[0][3], "2026-10-01");
    assert.equal(weeks.at(-1)!.at(-1), "2026-11-01");
    assert.ok(weeks.every((w) => w.length === 7));
  });
  test("a month that starts on Monday has no days of the previous month", () => {
    assert.equal(monthGrid("2026-06")[0][0], "2026-06-01");
  });
  test("previous and next month, across years", () => {
    assert.equal(addMonths("2026-12", 1), "2027-01");
    assert.equal(addMonths("2026-01", -1), "2025-12");
    assert.equal(addMonths("2026-10", -13), "2025-09");
    assert.equal(monthOf("2026-10-14"), "2026-10");
    assert.ok(isMonthKey("2026-10") && !isMonthKey("2026-13") && !isMonthKey("nope"));
  });
});

describe("sessions on the selected date", () => {
  test("weekly sessions appear on their weekdays", () => {
    // Wed 14 Oct: Junior Tennis 17:30 and U12 Football 18:00. Sat 17: nothing.
    assert.deepEqual(sessionsOn("2026-10-14").map((s) => s.groupId), ["g3", "g1"]);
    assert.deepEqual(sessionsOn("2026-10-17"), []);
  });
  test("one-off, moved and cancelled sessions show on the right dates", () => {
    let changes = createOneOff(NO_CHANGES, { groupId: "g2", title: "Game", date: "2026-10-17", time: "10:00", durationMin: 60, place: "Hall" }, "oo-1").changes;
    changes = updateSession(changes, "g1-2026-10-14", { date: "2026-10-16" });
    changes = cancelSession(changes, "g3-2026-10-14");
    assert.deepEqual(sessionsOn("2026-10-17", changes).map((s) => s.id), ["oo-1"]);
    assert.deepEqual(sessionsOn("2026-10-14", changes).map((s) => [s.id, s.status]), [["g3-2026-10-14", "cancelled"]]);
    assert.ok(sessionsOn("2026-10-16", changes).some((s) => s.id === "g1-2026-10-14"));
  });
});
