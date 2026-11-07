// The latest announcement pinned on Home (src/data/pinned.ts), D-076.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { firstLine, normaliseHiddenPins, pinnedAnnouncement } from "@/data/pinned";
import type { Announcement } from "@/data/types";

const an = (id: string, groupId: string | null, postedAt: string): Announcement => ({ id, groupId, title: id, body: `Line one of ${id}\nLine two`, authorId: "coach", postedAt });
const list = [an("a1", "g1", "2026-10-10T09:00:00Z"), an("a2", null, "2026-10-12T09:00:00Z"), an("a3", "g2", "2026-10-13T09:00:00Z")];

describe("pinned announcement", () => {
  test("the newest announcement, for everyone or for the viewer's groups", () => {
    assert.equal(pinnedAnnouncement(list, undefined)?.id, "a3");
    assert.equal(pinnedAnnouncement(list, undefined, ["g1"])?.id, "a2", "a group the player is not in is left out");
    assert.equal(pinnedAnnouncement([list[0]], undefined, ["g2"]), undefined);
    assert.equal(pinnedAnnouncement([], undefined), undefined);
  });
  test("a closed announcement stays hidden until a newer one is posted", () => {
    assert.equal(pinnedAnnouncement(list, "a3"), undefined);
    const newer = [...list, an("a4", "g1", "2026-10-14T09:00:00Z")];
    assert.equal(pinnedAnnouncement(newer, "a3")?.id, "a4");
  });
  test("first line and saved values", () => {
    assert.equal(firstLine("  Hello\nmore"), "Hello");
    assert.deepEqual(normaliseHiddenPins({ coach: "a1", player: 3, other: "x" }), { coach: "a1" });
    assert.deepEqual(normaliseHiddenPins(null), {});
  });
});
