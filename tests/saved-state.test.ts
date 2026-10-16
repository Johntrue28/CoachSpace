// Saved demo data is checked before use (D-069): malformed values fall back to the seed instead of
// breaking a page, and nothing well formed is ever dropped.
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSavedState } from "@/data/saved-state";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";
import { pilates } from "@/data/scenarios/pilates";
import { seedAttendance } from "@/data/attendance";
import { applyScenario } from "@/data/scenario";
import { seedSessionPlans } from "@/data/seed-plans";
import { NO_CHANGES } from "@/data/calendar";

const seedOf = (s: typeof tennis) => {
  applyScenario(s);
  const now = new Date(2026, 9, 14, 12, 0);
  return {
    exercises: s.exercises,
    assignments: s.assignments,
    announcements: s.announcements,
    attendance: seedAttendance(s.groups.map((g) => g.id), now, s.attendanceRate),
    schedule: {
      overrides: { [`${s.groups[0].id}-2026-10-14`]: { cancelled: true, cancelReason: "Rain" }, [`${s.groups[1].id}-2026-10-13`]: { time: "18:00", endTime: "19:30" } },
      oneOffs: [{ id: "oo-1", groupId: s.groups[0].id, title: "Friendly", date: "2026-10-17", time: "10:00", endTime: "11:30", place: "Court 1" }],
    },
    plans: [...s.plans, ...seedSessionPlans(s.plans, s.sessionPlanSeeds, now)],
    notes: s.notes,
    features: { attendanceEnabled: true },
    calendarHiddenGroups: [],
  };
};

for (const s of [tennis, football, basketball, pilates]) {
  test(`${s.id}: well-formed saved data is kept exactly`, () => {
    const saved = JSON.parse(JSON.stringify(seedOf(s)));
    const seed = { ...seedOf(s), exercises: [], assignments: [], announcements: [], attendance: [], schedule: NO_CHANGES, plans: [], notes: [] };
    assert.deepEqual(checkSavedState(saved, seed), saved);
  });
}

test("malformed fields fall back to the seed; malformed entries are left out", () => {
  applyScenario(tennis);
  const seed = { ...seedOf(tennis), schedule: NO_CHANGES };
  const checked = checkSavedState(
    {
      exercises: "oops",
      assignments: [null, 3, { id: "x" }, seed.assignments[0]],
      announcements: 5,
      attendance: [{ sessionId: "g1-2026-10-12", groupId: "g1", marks: { p01: "maybe" }, savedAt: "x" }],
      schedule: { overrides: 3 },
      plans: {},
      notes: [{ sessionId: 1 }],
      features: { attendanceEnabled: false },
    },
    seed,
  );
  assert.deepEqual(checked.exercises, seed.exercises, "not a list: the seed");
  assert.deepEqual(checked.assignments, [seed.assignments[0]], "only the well-formed assignment");
  assert.deepEqual(checked.announcements, seed.announcements);
  assert.deepEqual(checked.attendance, [], "an unknown mark is dropped");
  assert.deepEqual(checked.schedule, NO_CHANGES);
  assert.deepEqual(checked.plans, seed.plans);
  assert.deepEqual(checked.notes, []);
  assert.deepEqual(checked.features, { attendanceEnabled: false }, "other fields pass through to their own checks");
});

test("calendar changes keep valid overrides and one-off sessions only", () => {
  const checked = checkSavedState(
    {
      schedule: {
        overrides: { "g1-2026-10-14": { cancelled: true }, "g2-2026-10-13": { time: 1800 }, "g3-2026-10-13": "x" },
        oneOffs: [{ id: "oo-1", groupId: "g1", title: "A", date: "2026-10-17", time: "10:00", endTime: "11:00", place: "P" }, { id: "oo-2" }],
      },
    },
    { ...seedOf(tennis), schedule: NO_CHANGES },
  );
  assert.deepEqual(Object.keys((checked.schedule as typeof NO_CHANGES).overrides), ["g1-2026-10-14"]);
  assert.deepEqual((checked.schedule as typeof NO_CHANGES).oneOffs.map((o) => o.id), ["oo-1"]);
});
