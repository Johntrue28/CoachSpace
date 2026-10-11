// Calendar changes: one-off sessions, rescheduling, place changes and cancellations.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NO_CHANGES, regularSession, sessionById, sessionsOn, upcomingSessions, weekDays } from "@/data/calendar";
import {
  cancelSession,
  createOneOff,
  resetToSchedule,
  restoreSession,
  updateSession,
  validateSessionInput,
  type SessionInput,
} from "@/data/schedule";

// U12 Football (g1) trains Mon & Wed 18:00–19:15 at Pitch 2. Monday 12 Oct 2026.
const MON = "g1-2026-10-12";
const input: SessionInput = { groupId: "g1", title: "Friendly match", date: "2026-10-17", time: "10:00", durationMin: 90, place: "Pitch 1" };

describe("one-off sessions", () => {
  test("a one-off session appears on its date with its group", () => {
    const { changes, session } = createOneOff(NO_CHANGES, input, "oo-1");
    assert.equal(session.endTime, "11:30");
    const day = sessionsOn("2026-10-17", changes);
    assert.deepEqual(day.map((s) => [s.id, s.kind, s.groupId, s.title]), [["oo-1", "one-off", "g1", "Friendly match"]]);
    assert.equal(sessionById("oo-1", changes)?.place, "Pitch 1");
    assert.equal(sessionById("oo-1", changes)?.placeChanged, true);
  });
  test("creating a one-off does not change the recurring schedule", () => {
    const { changes } = createOneOff(NO_CHANGES, input, "oo-1");
    assert.deepEqual(weekDays("2026-10-12", { changes }).slice(0, 5), weekDays("2026-10-12").slice(0, 5));
    assert.deepEqual(changes.overrides, {});
  });
  test("one-off ids must start with oo-", () => {
    assert.throws(() => createOneOff(NO_CHANGES, input, "x-1"));
  });
  test("validation reports missing or invalid fields", () => {
    assert.deepEqual(validateSessionInput(input), {});
    const errors = validateSessionInput({ groupId: "zz", title: " ", date: "nope", time: "25:00", durationMin: 5, place: "" });
    assert.deepEqual(Object.keys(errors).sort(), ["date", "durationMin", "groupId", "place", "time", "title"]);
    assert.ok(validateSessionInput({ ...input, time: "23:00", durationMin: 120 }).durationMin);
  });
});

describe("rescheduling", () => {
  test("moves one session to another date and time, keeping its id", () => {
    const changes = updateSession(NO_CHANGES, MON, { date: "2026-10-13", time: "17:00" });
    const s = sessionById(MON, changes)!;
    assert.deepEqual([s.date, s.time, s.endTime], ["2026-10-13", "17:00", "18:15"]);
    assert.deepEqual(s.movedFrom, { date: "2026-10-12", time: "18:00" });
    assert.equal(sessionsOn("2026-10-12", changes).some((x) => x.id === MON), false);
    assert.equal(sessionsOn("2026-10-13", changes).some((x) => x.id === MON), true);
  });
  test("only stores what differs from the weekly schedule", () => {
    const changes = updateSession(NO_CHANGES, MON, { time: "18:30" });
    assert.deepEqual(changes.overrides[MON], { time: "18:30", endTime: "19:45" });
    const back = updateSession(changes, MON, { time: "18:00" });
    assert.equal(back.overrides[MON], undefined);
  });
  test("can change the duration", () => {
    const changes = updateSession(NO_CHANGES, MON, { durationMin: 90 });
    assert.equal(sessionById(MON, changes)?.endTime, "19:30");
  });
  test("changing the place affects only that session", () => {
    const changes = updateSession(NO_CHANGES, MON, { place: "Indoor hall" });
    assert.equal(sessionById(MON, changes)?.place, "Indoor hall");
    assert.equal(sessionById(MON, changes)?.placeChanged, true);
    assert.equal(sessionById("g1-2026-10-14", changes)?.place, "Pitch 2");
  });
  test("a one-off session can be rescheduled and moved", () => {
    const { changes } = createOneOff(NO_CHANGES, input, "oo-1");
    const moved = updateSession(changes, "oo-1", { date: "2026-10-18", place: "Pitch 3" });
    const s = sessionById("oo-1", moved)!;
    assert.deepEqual([s.date, s.time, s.endTime, s.place], ["2026-10-18", "10:00", "11:30", "Pitch 3"]);
  });
  test("reset puts a session back to the schedule", () => {
    const changes = resetToSchedule(updateSession(NO_CHANGES, MON, { date: "2026-10-13" }), MON);
    assert.deepEqual(sessionById(MON, changes), regularSession(MON));
  });
});

describe("cancellation", () => {
  test("cancels one session and keeps it visible as cancelled", () => {
    const changes = cancelSession(NO_CHANGES, MON, "Pitch closed");
    const s = sessionById(MON, changes)!;
    assert.equal(s.status, "cancelled");
    assert.equal(s.cancelReason, "Pitch closed");
    assert.equal(sessionsOn("2026-10-12", changes).find((x) => x.id === MON)?.status, "cancelled");
  });
  test("the recurring schedule is preserved: other weeks and days are unchanged", () => {
    const changes = cancelSession(NO_CHANGES, MON);
    assert.equal(sessionById("g1-2026-10-14", changes)?.status, "scheduled");
    assert.equal(sessionById("g1-2026-10-19", changes)?.status, "scheduled");
    assert.deepEqual(weekDays("2026-10-19", { changes }), weekDays("2026-10-19"));
  });
  test("upcoming lists can skip cancelled sessions", () => {
    const changes = cancelSession(NO_CHANGES, MON);
    const now = new Date(2026, 9, 12, 12, 0);
    assert.equal(upcomingSessions(now, { groupId: "g1", changes, limit: 1 })[0].id, MON);
    assert.equal(upcomingSessions(now, { groupId: "g1", changes, limit: 1, activeOnly: true })[0].id, "g1-2026-10-14");
  });
  test("restoring undoes the cancellation but keeps other changes", () => {
    const changes = restoreSession(cancelSession(updateSession(NO_CHANGES, MON, { place: "Hall" }), MON), MON);
    const s = sessionById(MON, changes)!;
    assert.equal(s.status, "scheduled");
    assert.equal(s.place, "Hall");
  });
  test("one-off sessions can be cancelled and restored", () => {
    const { changes } = createOneOff(NO_CHANGES, input, "oo-1");
    assert.equal(sessionById("oo-1", cancelSession(changes, "oo-1"))?.status, "cancelled");
    assert.equal(sessionById("oo-1", restoreSession(cancelSession(changes, "oo-1"), "oo-1"))?.status, "scheduled");
  });
  test("unknown sessions are ignored", () => {
    assert.equal(cancelSession(NO_CHANGES, "g1-2026-10-13"), NO_CHANGES);
    assert.equal(sessionById("oo-missing", NO_CHANGES), undefined);
  });
});
