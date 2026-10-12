// Calendar colours by session state (src/data/calendar.ts, D-045).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NO_CHANGES, sessionById, sessionState } from "@/data/calendar";
import { cancelSession, createOneOff, updateSession } from "@/data/schedule";

describe("session state", () => {
  test("a generated session is regular", () => {
    assert.equal(sessionState(sessionById("g1-2026-10-14", NO_CHANGES)!), "regular");
  });

  test("a moved session or one at a new place is changed", () => {
    const moved = updateSession(NO_CHANGES, "g2-2026-10-15", { date: "2026-10-16", time: "18:00" });
    assert.equal(sessionState(sessionById("g2-2026-10-15", moved)!), "changed");
    const place = updateSession(NO_CHANGES, "g4-2026-10-15", { place: "Studio B" });
    assert.equal(sessionState(sessionById("g4-2026-10-15", place)!), "changed");
  });

  test("a one-off session is extra", () => {
    const { changes } = createOneOff(
      NO_CHANGES,
      { groupId: "g2", title: "Friendly game", date: "2026-10-17", time: "10:00", durationMin: 90, place: "Main hall" },
      "oo-test",
    );
    assert.equal(sessionState(sessionById("oo-test", changes)!), "extra");
  });

  test("cancelled wins over every other state", () => {
    const moved = updateSession(NO_CHANGES, "g2-2026-10-15", { date: "2026-10-16" });
    const cancelled = cancelSession(moved, "g2-2026-10-15", "Hall closed");
    assert.equal(sessionState(sessionById("g2-2026-10-15", cancelled)!), "cancelled");
  });
});
