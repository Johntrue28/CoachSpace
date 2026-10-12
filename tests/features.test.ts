// Global feature switches (src/data/features.ts), D-042.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_FEATURES, isAttendancePath, normaliseFeatures, visibleItems } from "@/data/features";
import { coachMore, coachSidebar, coachTabs, participantNav } from "@/components/shell/sections";

const off = { attendanceEnabled: false };

describe("feature settings", () => {
  test("attendance is on by default", () => {
    assert.equal(DEFAULT_FEATURES.attendanceEnabled, true);
  });
  test("older saves without settings, or with invalid values, get the defaults", () => {
    assert.deepEqual(normaliseFeatures(undefined), DEFAULT_FEATURES);
    assert.deepEqual(normaliseFeatures({}), DEFAULT_FEATURES);
    assert.deepEqual(normaliseFeatures({ attendanceEnabled: "no" }), DEFAULT_FEATURES);
    assert.deepEqual(normaliseFeatures({ attendanceEnabled: false }), off);
  });
});

describe("attendance pages", () => {
  test("recognises the attendance page and a session's attendance page", () => {
    assert.equal(isAttendancePath("/attendance"), true);
    assert.equal(isAttendancePath("/attendance?group=g1"), true);
    assert.equal(isAttendancePath("/calendar/g1-2026-10-14/attendance?group=g1"), true);
  });
  test("other pages are not attendance pages", () => {
    assert.equal(isAttendancePath("/calendar/g1-2026-10-14"), false);
    assert.equal(isAttendancePath("/attendances"), false);
    assert.equal(isAttendancePath("/"), false);
  });
});

describe("navigation with attendance switched off", () => {
  const labels = (items: { label: string }[]) => items.map((i) => i.label);
  test("the sidebar and More lose Attendance and keep everything else", () => {
    assert.deepEqual(labels(visibleItems(coachSidebar, off)), ["Dashboard", "Calendar", "Groups", "Exercise Library", "Chat", "Announcements"]);
    assert.deepEqual(labels(visibleItems(coachMore, off)), ["Exercise Library", "Announcements"]);
  });
  test("switching it on again restores the same items", () => {
    assert.deepEqual(visibleItems(coachSidebar, DEFAULT_FEATURES), coachSidebar);
    assert.deepEqual(visibleItems(coachMore, DEFAULT_FEATURES), coachMore);
  });
  test("menus without attendance are unchanged", () => {
    assert.deepEqual(visibleItems(coachTabs, off), coachTabs);
    assert.deepEqual(visibleItems(participantNav, off), participantNav);
  });
});
