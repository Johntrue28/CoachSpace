// Calendar group filter (src/data/calendar-filter.ts, D-047).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { SHOW_ALL, hideAll, normaliseHidden, onlyGroup, selectionState, toggleGroup, visibleGroupIds } from "@/data/calendar-filter";

const all = ["g1", "g2", "g3", "g4"];

describe("calendar group filter", () => {
  test("every group is shown by default", () => {
    assert.deepEqual(visibleGroupIds(all, SHOW_ALL), all);
    assert.equal(selectionState(all, SHOW_ALL), "all");
  });

  test("selecting one group from none", () => {
    const hidden = toggleGroup(all, hideAll(all), "g2");
    assert.deepEqual(visibleGroupIds(all, hidden), ["g2"]);
    assert.equal(selectionState(all, hidden), "some");
  });

  test("selecting several groups", () => {
    let hidden = hideAll(all);
    hidden = toggleGroup(all, hidden, "g1");
    hidden = toggleGroup(all, hidden, "g3");
    assert.deepEqual(visibleGroupIds(all, hidden), ["g1", "g3"]);
  });

  test("deselecting a group hides it; selecting it again shows it", () => {
    const hidden = toggleGroup(all, SHOW_ALL, "g4");
    assert.deepEqual(visibleGroupIds(all, hidden), ["g1", "g2", "g3"]);
    assert.equal(selectionState(all, toggleGroup(all, hidden, "g4")), "all");
  });

  test("clearing and restoring", () => {
    assert.equal(selectionState(all, hideAll(all)), "none");
    assert.deepEqual(visibleGroupIds(all, hideAll(all)), []);
    assert.equal(selectionState(all, SHOW_ALL), "all");
  });

  test("only one group (a group's View sessions)", () => {
    assert.deepEqual(visibleGroupIds(all, onlyGroup(all, "g3")), ["g3"]);
    assert.deepEqual(onlyGroup(all, "nope"), SHOW_ALL);
  });

  test("unknown, duplicate or invalid saved ids never break the filter", () => {
    assert.deepEqual(normaliseHidden(["g1", "g1", 4, null, "gone"], all), ["g1"]);
    assert.deepEqual(normaliseHidden("g1"), []);
    assert.deepEqual(normaliseHidden(undefined), []);
    // A removed group that was hidden does not make the selection look partial.
    assert.equal(selectionState(all, ["gone"]), "all");
    // A new group (not in the saved hidden list) is shown.
    assert.deepEqual(visibleGroupIds([...all, "g5"], ["g1"]), ["g2", "g3", "g4", "g5"]);
    assert.deepEqual(toggleGroup(all, ["gone", "g2"], "g1"), ["g2", "g1"]);
  });
});
