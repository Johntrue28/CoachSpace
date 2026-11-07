// In-app history used by back links.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { labelForUrl, nextStack, previousUrl } from "@/components/navigation/history";

describe("history stack", () => {
  test("pushes, replaces and goes back", () => {
    let s = nextStack([], "/groups", "push");
    s = nextStack(s, "/groups/g1", "push");
    s = nextStack(s, "/calendar/g1-2026-10-14", "push");
    assert.equal(previousUrl(s), "/groups/g1");
    s = nextStack(s, "/groups/g1", "push"); // browser Back
    assert.deepEqual(s, ["/groups", "/groups/g1"]);
    s = nextStack(s, "/groups/g1?tab=x", "replace");
    assert.deepEqual(s, ["/groups", "/groups/g1?tab=x"]);
  });
  test("direct entry has no previous page", () => {
    const s = nextStack([], "/me/videos/e8", "push");
    assert.equal(previousUrl(s), null);
  });
  test("browser forward is treated as a new entry", () => {
    let s = nextStack(["/library"], "/library/e1", "push");
    s = nextStack(s, "/library", "push"); // Back
    s = nextStack(s, "/library/e1", "push"); // Forward
    assert.deepEqual(s, ["/library", "/library/e1"]);
  });
  test("a link to the previous page counts as going back", () => {
    assert.deepEqual(nextStack(["/groups", "/groups/g1"], "/groups", "push"), ["/groups"]);
  });
  test("the same URL twice does not add an entry", () => {
    assert.deepEqual(nextStack(["/chat"], "/chat", "push"), ["/chat"]);
  });
  test("a replaced form page does not stay in the history", () => {
    // Calendar -> New session -> (save, replace) -> new session's page.
    let s = nextStack(["/calendar"], "/calendar/new", "push");
    s = nextStack(s, "/calendar/oo-1", "replace");
    assert.equal(previousUrl(s), "/calendar");
  });
});

describe("back link labels", () => {
  const names = { group: (id: string) => ({ g1: "U12 Football" })[id], exercise: (id: string) => ({ e1: "Rondo" })[id] };
  test("names the page the user came from", () => {
    assert.equal(labelForUrl("/groups/g1", names), "U12 Football");
    assert.equal(labelForUrl("/groups/new", names), "Groups");
    assert.equal(labelForUrl("/calendar?date=2026-10-14"), "Calendar");
    assert.equal(labelForUrl("/calendar/g1-2026-10-14"), "Session");
    assert.equal(labelForUrl("/library/e1", names), "Rondo");
    assert.equal(labelForUrl("/library/plans"), "Plans");
    assert.equal(labelForUrl("/me/videos"), "Exercises");
    assert.equal(labelForUrl("/"), "Home");
    assert.equal(labelForUrl("/me"), "Home");
  });
});
