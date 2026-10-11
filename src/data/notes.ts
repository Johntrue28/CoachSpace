// Coach memory (D-033): three short notes after a session, linked to the session and its
// group, and shown again when the coach prepares that group's next session. Pure functions.

import type { CoachNote, Session } from "./types";

export const NOTE_MAX = 280;

export type NoteInput = Pick<CoachNote, "sessionId" | "groupId" | "worked" | "improve" | "revisit">;

export function isEmptyNote(n: Pick<CoachNote, "worked" | "improve" | "revisit">) {
  return !n.worked.trim() && !n.improve.trim() && !n.revisit.trim();
}

/** Saves the note of a session (one per session). Saving three empty fields removes it. */
export function saveNote(notes: CoachNote[], input: NoteInput, now: string): CoachNote[] {
  const rest = notes.filter((n) => n.sessionId !== input.sessionId);
  const clean = {
    ...input,
    worked: input.worked.trim().slice(0, NOTE_MAX),
    improve: input.improve.trim().slice(0, NOTE_MAX),
    revisit: input.revisit.trim().slice(0, NOTE_MAX),
  };
  return isEmptyNote(clean) ? rest : [...rest, { ...clean, savedAt: now }];
}

export function noteForSession(notes: CoachNote[], sessionId: string) {
  return notes.find((n) => n.sessionId === sessionId);
}

/**
 * Notes of earlier sessions of the same group, newest session first. `findSession` gives
 * each note's session (with calendar changes applied) so the order follows the real dates.
 */
export function previousNotes(
  notes: CoachNote[],
  groupId: string,
  before: Pick<Session, "date" | "time"> | null,
  findSession: (sessionId: string) => Pick<Session, "date" | "time"> | undefined,
  limit = 2,
) {
  const key = (s: Pick<Session, "date" | "time">) => `${s.date}T${s.time}`;
  return notes
    .filter((n) => n.groupId === groupId)
    .map((note) => ({ note, session: findSession(note.sessionId) }))
    .filter((x): x is { note: CoachNote; session: Pick<Session, "date" | "time"> } => Boolean(x.session))
    .filter((x) => !before || key(x.session) < key(before))
    .sort((a, b) => key(b.session).localeCompare(key(a.session)))
    .slice(0, limit);
}
