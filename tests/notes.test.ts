// Coach memory: notes linked to a session and its group.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NO_CHANGES, sessionById } from "@/data/calendar";
import { updateSession } from "@/data/schedule";
import { NOTE_MAX, noteForSession, previousNotes, saveNote } from "@/data/notes";
import type { CoachNote } from "@/data/types";

const NOW = "2026-10-12T20:00:00Z";
const note = (sessionId: string, groupId: string, worked = "w") => ({ sessionId, groupId, worked, improve: "i", revisit: "r" });

describe("saving notes", () => {
  test("a note is linked to its session and group", () => {
    const notes = saveNote([], note("g1-2026-10-12", "g1"), NOW);
    assert.deepEqual(noteForSession(notes, "g1-2026-10-12"), { ...note("g1-2026-10-12", "g1"), savedAt: NOW });
  });
  test("one note per session: saving again replaces it", () => {
    let notes = saveNote([], note("g1-2026-10-12", "g1", "first"), NOW);
    notes = saveNote(notes, note("g1-2026-10-12", "g1", "second"), NOW);
    assert.equal(notes.length, 1);
    assert.equal(notes[0].worked, "second");
  });
  test("trims, limits length and removes a note saved empty", () => {
    let notes = saveNote([], { ...note("s", "g1"), worked: `  ${"x".repeat(NOTE_MAX + 50)}  ` }, NOW);
    assert.equal(notes[0].worked.length, NOTE_MAX);
    notes = saveNote(notes, { sessionId: "s", groupId: "g1", worked: " ", improve: "", revisit: "" }, NOW);
    assert.deepEqual(notes, []);
  });
});

describe("previous notes for the next session", () => {
  const notes: CoachNote[] = [
    { ...note("g1-2026-10-07", "g1", "older"), savedAt: NOW },
    { ...note("g1-2026-10-12", "g1", "latest"), savedAt: NOW },
    { ...note("g2-2026-10-13", "g2", "other group"), savedAt: NOW },
  ];
  const find = (id: string) => sessionById(id);

  test("shows notes of the same group from earlier sessions, newest first", () => {
    const next = sessionById("g1-2026-10-14")!;
    assert.deepEqual(previousNotes(notes, "g1", next, find).map((x) => x.note.worked), ["latest", "older"]);
  });
  test("never shows notes from other groups or later sessions", () => {
    const monday = sessionById("g1-2026-10-12")!;
    assert.deepEqual(previousNotes(notes, "g1", monday, find).map((x) => x.note.worked), ["older"]);
    assert.deepEqual(previousNotes(notes, "g2", sessionById("g2-2026-10-15")!, find).map((x) => x.note.worked), ["other group"]);
  });
  test("follows rescheduled dates", () => {
    // The 7 Oct session is moved after the 12 Oct one: it becomes the latest.
    const changes = updateSession(NO_CHANGES, "g1-2026-10-07", { date: "2026-10-13" });
    const next = sessionById("g1-2026-10-14")!;
    const list = previousNotes(notes, "g1", next, (id) => sessionById(id, changes));
    assert.deepEqual(list.map((x) => x.note.worked), ["older", "latest"]);
  });
  test("respects the limit and works without a reference session", () => {
    assert.equal(previousNotes(notes, "g1", null, find, 1).length, 1);
  });
});
