// App shell navigation (src/components/shell/sections.ts), event-centred since D-071.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { coachMore, coachSidebar, coachTabs, headerNewSession, isActive, isParticipantPath, participantNav, sectionTitle } from "@/components/shell/sections";

describe("active navigation item", () => {
  test("Agenda is active on the coach home and on a session's pages", () => {
    assert.equal(isActive("/", "/"), true);
    assert.equal(isActive("/", "/calendar/g1-2026-10-14/attendance"), true);
    assert.equal(isActive("/", "/calendar"), false);
    assert.equal(isActive("/", "/calendar/new"), false);
    assert.equal(isActive("/", "/groups"), false);
  });
  test("Messages covers chats and announcements, without prefix clashes", () => {
    assert.equal(isActive("/chat", "/chat/c-g1"), true);
    assert.equal(isActive("/chat", "/announcements/new"), true);
    assert.equal(isActive("/chat", "/chats"), false);
  });
  test("the header menu covers every secondary destination", () => {
    for (const path of ["/more", "/calendar", "/attendance", "/settings"]) {
      assert.equal(isActive("/more", path), true, path);
    }
    assert.equal(isActive("/more", "/library"), false);
  });
  test("participant Agenda covers their group and session pages", () => {
    assert.equal(isActive("/me", "/me/groups/g2"), true);
    assert.equal(isActive("/me", "/me/calendar/g2-2026-10-14"), true);
    assert.equal(isActive("/me", "/me/videos"), false);
    assert.equal(isActive("/me/chat", "/me/announcements"), true);
  });
});

describe("views and titles", () => {
  test("participant pages are everything under /me", () => {
    assert.equal(isParticipantPath("/me"), true);
    assert.equal(isParticipantPath("/me/chat/c-g2"), true);
    assert.equal(isParticipantPath("/media"), false);
  });
  test("four coach places, three participant places, Settings last in the menu", () => {
    assert.deepEqual(coachTabs.map((i) => i.label), ["Agenda", "Groups", "Library", "Messages"]);
    assert.deepEqual(coachSidebar, coachTabs);
    assert.deepEqual(coachMore.map((i) => i.label), ["Calendar", "Attendance", "Settings"]);
    assert.deepEqual(participantNav.map((i) => i.label), ["Agenda", "Exercises", "Messages"]);
  });
  test("section titles follow the active item", () => {
    assert.equal(sectionTitle("/"), "Agenda");
    assert.equal(sectionTitle("/library/new"), "Library");
    assert.equal(sectionTitle("/announcements"), "Messages");
    assert.equal(sectionTitle("/more"), "Menu");
    assert.equal(sectionTitle("/settings"), "Settings");
    assert.equal(sectionTitle("/me/groups/g2"), "Agenda");
    assert.equal(sectionTitle("/me/videos/e1"), "Exercises");
  });
});

describe("one primary action per screen (R8)", () => {
  test("the header's New session is primary only on the Agenda, hidden where the page has its own", () => {
    assert.equal(headerNewSession("/"), "primary");
    assert.equal(headerNewSession("/groups"), "secondary");
    assert.equal(headerNewSession("/library"), "secondary");
    assert.equal(headerNewSession("/calendar"), null);
    assert.equal(headerNewSession("/calendar/new"), null);
    assert.equal(headerNewSession("/me"), null);
    assert.equal(headerNewSession("/me/videos"), null);
  });
});
