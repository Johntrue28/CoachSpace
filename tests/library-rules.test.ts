import { test } from "node:test";
import assert from "node:assert/strict";
import { hasVideo, videoLinkKind } from "@/data/exercises";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";

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
  for (const s of [tennis, football, basketball]) {
    for (const e of s.exercises) {
      if (e.videoUrl) assert.equal(videoLinkKind(e.videoUrl), "search", `${s.id} ${e.id} links to a search, not an unchecked video`);
    }
  }
});

