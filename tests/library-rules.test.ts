import { test } from "node:test";
import assert from "node:assert/strict";
import { assignToGroup, hasVideo, videoLinkKind, wholeGroupExerciseIds } from "@/data/exercises";
import type { Assignment } from "@/data/types";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";
import { pilates } from "@/data/scenarios/pilates";

// D-057: a YouTube search is never presented as a video.
test("video links are told apart from searches and other links", () => {
  assert.equal(videoLinkKind("https://www.youtube.com/watch?v=abc123XYZ"), "video");
  assert.equal(videoLinkKind("https://youtu.be/abc123XYZ"), "video");
  assert.equal(videoLinkKind("https://vimeo.com/123456789"), "video");
  assert.equal(videoLinkKind("https://www.youtube.com/results?search_query=rondo+4v1"), "search");
  assert.equal(videoLinkKind("https://m.youtube.com/results?search_query=serve"), "search");
  assert.equal(videoLinkKind("https://www.youtube.com/results"), "other");
  assert.equal(videoLinkKind("https://example.com/drill"), "other");
  assert.equal(videoLinkKind("not a link"), "other");
});

test("hasVideo is true only for a specific video", () => {
  assert.equal(hasVideo({}), false);
  assert.equal(hasVideo({ videoUrl: "https://www.youtube.com/results?search_query=serve" }), false);
  assert.equal(hasVideo({ videoUrl: "https://youtu.be/abc123XYZ" }), true);
});

test("no seeded exercise claims a video that was not checked", () => {
  for (const s of [tennis, football, basketball, pilates]) {
    for (const e of s.exercises) {
      if (e.videoUrl) assert.equal(videoLinkKind(e.videoUrl), "search", `${s.id} ${e.id} links to a search, not an unchecked video`);
    }
  }
});

// D-059: group-first assignment.
test("assigning several exercises to a group adds, widens or keeps assignments", () => {
  const base: Assignment[] = [
    { id: "a1", exerciseId: "e1", groupId: "g1", audience: "group", participantIds: [], customInstructions: "Keep it light.", assignedOn: "2026-10-01" },
    { id: "a2", exerciseId: "e2", groupId: "g1", audience: "selected", participantIds: ["p1"], customInstructions: "", assignedOn: "2026-10-01" },
    { id: "a3", exerciseId: "e3", groupId: "g2", audience: "group", participantIds: [], customInstructions: "", assignedOn: "2026-10-01" },
  ];
  let n = 0;
  const next = assignToGroup(base, "g1", ["e1", "e2", "e3", "e3"], "  This week  ", "2026-10-14", () => `new${++n}`);
  // e1 already whole-group: unchanged, including its instructions.
  assert.deepEqual(next.find((a) => a.id === "a1"), base[0]);
  // e2 for selected participants: widened to the whole group with the new instructions.
  assert.deepEqual(next.find((a) => a.id === "a2"), { ...base[1], audience: "group", participantIds: [], customInstructions: "This week" });
  // e3 is new for g1 (once, despite the duplicate), and g2's assignment is untouched.
  const added = next.filter((a) => a.id.startsWith("new"));
  assert.deepEqual(added, [{ id: "new1", exerciseId: "e3", groupId: "g1", audience: "group", participantIds: [], customInstructions: "This week", assignedOn: "2026-10-14" }]);
  assert.deepEqual(next.find((a) => a.id === "a3"), base[2]);
  assert.deepEqual([...wholeGroupExerciseIds(next, "g1")].sort(), ["e1", "e2", "e3"]);
  assert.deepEqual([...wholeGroupExerciseIds(base, "g1")], ["e1"]);
  // Empty instructions keep a widened assignment's own instructions.
  const kept = assignToGroup([{ ...base[1], customInstructions: "Own" }], "g1", ["e2"], "", "2026-10-14", () => "x");
  assert.equal(kept[0].customInstructions, "Own");
});
