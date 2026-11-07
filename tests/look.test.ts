// R11 polish (D-074): group colours, week strip, countdowns, photos and the player's attendance.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { GROUP_COLOURS, SPORT_PHOTOS, countdown, groupColour, photoSrc, sessionPhoto, weekStrip } from "@/data/look";
import { seasonOf } from "@/data/season";
import type { AttendanceRecord } from "@/data/types";
import { existsSync } from "node:fs";

function lum(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

describe("group colours", () => {
  test("every colour is readable as text on white and on its soft tint", () => {
    for (const c of GROUP_COLOURS) {
      assert.ok(contrast(c.solid, "#ffffff") >= 4.5, `${c.name} on white`);
      assert.ok(contrast(c.solid, c.soft) >= 4.5, `${c.name} on its tint`);
    }
  });
  test("a group keeps its colour by position, wrapping after six; unknown groups get the first", () => {
    const ids = ["g1", "g2", "g3", "g4", "g5", "g6", "g7"];
    assert.equal(groupColour("g2", ids).name, "orange");
    assert.equal(groupColour("g7", ids).name, "blue");
    assert.equal(groupColour("zz", ids).name, "blue");
  });
});

describe("week strip", () => {
  const sessions: Record<string, { groupId: string; status?: string }[]> = {
    "2026-10-14": [{ groupId: "g1" }, { groupId: "g4" }, { groupId: "g1" }],
    "2026-10-15": [{ groupId: "g2", status: "cancelled" }],
  };
  const strip = weekStrip("2026-10-14", (d) => sessions[d] ?? []);
  test("seven days from today with weekday names and day numbers", () => {
    assert.equal(strip.length, 7);
    assert.deepEqual(strip.map((d) => d.weekday), ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"]);
    assert.deepEqual(strip.map((d) => d.day), [14, 15, 16, 17, 18, 19, 20]);
  });
  test("each group once per day; cancelled sessions add no dot", () => {
    assert.deepEqual(strip[0].groupIds, ["g1", "g4"]);
    assert.deepEqual(strip[1].groupIds, []);
  });
  test("crosses months", () => {
    assert.equal(weekStrip("2026-10-30", () => []).at(-1)?.date, "2026-11-05");
  });
});

describe("countdown", () => {
  const now = new Date(2026, 9, 14, 12, 40);
  const at = (h: number, m = 0, d = 14) => new Date(2026, 9, d, h, m);
  test("minutes, hours and days", () => {
    assert.equal(countdown(now, at(17)), "in 4 h 20 min");
    assert.equal(countdown(now, at(13, 5)), "in 25 min");
    assert.equal(countdown(now, at(14, 40)), "in 2 h");
    assert.equal(countdown(now, at(12, 41)), "Starting now");
    assert.equal(countdown(now, at(12, 40, 15)), "in 1 day");
    assert.equal(countdown(now, at(12, 0, 17)), "in 3 days");
  });
  test("under way until the end, then started", () => {
    assert.equal(countdown(now, at(12), at(13)), "Under way");
    assert.equal(countdown(now, at(11), at(12)), "Started");
  });
});

describe("photos", () => {
  test("every photo of every sport exists in both sizes", () => {
    for (const { cover, sessions } of Object.values(SPORT_PHOTOS)) {
      for (const name of [cover, ...sessions]) for (const w of [640, 1280] as const) assert.ok(existsSync(`public${photoSrc(name, w)}`), name);
    }
  });
  test("a session always gets the same photo of its sport", () => {
    const p = sessionPhoto("g1-2026-10-14", "Tennis");
    assert.equal(p, sessionPhoto("g1-2026-10-14", "Tennis"));
    assert.ok(SPORT_PHOTOS.Tennis.sessions.includes(p));
  });
});

describe("my season", () => {
  const rec = (sessionId: string, mark: "present" | "absent" | null): AttendanceRecord => ({
    sessionId,
    groupId: "g1",
    marks: mark ? { p1: mark } : { p2: "present" },
    savedAt: "2026-10-20T10:00:00Z",
  });
  test("the rate counts only registers where the player had a mark", () => {
    const records = [rec("g1-2026-10-05", "present"), rec("g1-2026-10-07", "absent"), rec("g1-2026-10-12", "present"), rec("g1-2026-10-14", "present"), rec("g1-2026-10-09", null)];
    assert.deepEqual(seasonOf("p1", records), { attended: 3, total: 4, rate: 75 });
  });
  test("no registers: no rate", () => {
    assert.deepEqual(seasonOf("p1", []), { attended: 0, total: 0, rate: null });
  });
});
