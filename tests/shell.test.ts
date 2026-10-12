// App shell navigation (src/components/shell/sections.ts).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { coachMore, coachSidebar, coachTabs, isActive, isParticipantPath, participantNav, sectionTitle } from "@/components/shell/sections";

describe("active navigation item", () => {
  test("Dashboard is active only on the coach home", () => {
    assert.equal(isActive("/", "/"), true);
    assert.equal(isActive("/", "/groups"), false);
  });
  test("a section stays active on its detail pages, without prefix clashes", () => {
    assert.equal(isActive("/calendar", "/calendar/g1-2026-10-14/attendance"), true);
    assert.equal(isActive("/chat", "/chats"), false);
  });
  test("More covers every secondary destination", () => {
    for (const path of ["/more", "/library", "/library/plans/x", "/announcements/new", "/attendance", "/settings"]) {
      assert.equal(isActive("/more", path), true, path);
    }
    assert.equal(isActive("/more", "/calendar"), false);
  });
  test("participant Home covers the participant's group pages", () => {
    assert.equal(isActive("/me", "/me/groups/g2"), true);
    assert.equal(isActive("/me", "/me/announcements"), true);
    assert.equal(isActive("/me", "/me/videos"), false);
  });
});

describe("views and titles", () => {
  test("participant pages are everything under /me", () => {
    assert.equal(isParticipantPath("/me"), true);
    assert.equal(isParticipantPath("/me/chat/c-g2"), true);
    assert.equal(isParticipantPath("/media"), false);
  });
  test("Settings is the last sidebar item and listed on More", () => {
    assert.equal(coachSidebar.at(-1)?.href, "/settings");
    assert.equal(coachMore.at(-1)?.href, "/settings");
  });
  test("mobile tabs and participant navigation", () => {
    assert.deepEqual(coachTabs.map((i) => i.label), ["Dashboard", "Calendar", "Groups", "Chat", "More"]);
    assert.deepEqual(participantNav.map((i) => i.label), ["Home", "Calendar", "My Videos", "Chat"]);
  });
  test("section titles follow the active item", () => {
    assert.equal(sectionTitle("/"), "Dashboard");
    assert.equal(sectionTitle("/library/new"), "Exercise Library");
    assert.equal(sectionTitle("/more"), "More");
    assert.equal(sectionTitle("/settings"), "Settings");
    assert.equal(sectionTitle("/me/groups/g2"), "Home");
    assert.equal(sectionTitle("/me/videos/e1"), "My Videos");
  });
});
