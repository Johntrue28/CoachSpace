"use client";

// Demo data store.
// Holds the data the coach can change in the demo (exercises, assignments, announcements
// and attendance).
// Changes are saved in this browser only (localStorage). Nothing is sent to a server
// or to other users. In a later phase this will be replaced by a real backend.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Announcement, Assignment, AttendanceRecord, Exercise } from "./types";
import { seedAssignments, seedExercises } from "./exercises";
import { seedAnnouncements } from "./messages";

const STORAGE_KEY = "coachspace-demo-v1";

type DemoState = {
  exercises: Exercise[];
  assignments: Assignment[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
};

type DemoStore = DemoState & {
  /** False until saved data has been read from this device. */
  ready: boolean;
  addExercise: (exercise: Omit<Exercise, "id">) => Exercise;
  updateExercise: (id: string, changes: Omit<Exercise, "id">) => void;
  /** Replaces all assignments of one exercise (one per group at most). */
  replaceAssignments: (exerciseId: string, next: AssignmentDraft[]) => void;
  saveAssignment: (assignment: Omit<Assignment, "id"> & { id?: string }) => void;
  removeAssignment: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, "id" | "postedAt">) => Announcement;
  /** Creates or replaces the attendance of one session. */
  saveAttendance: (record: Omit<AttendanceRecord, "savedAt">) => void;
  resetDemo: () => void;
};

/** One group's assignment as edited in the assign screen. */
export type AssignmentDraft = Pick<Assignment, "groupId" | "audience" | "participantIds" | "customInstructions">;

const seedState: DemoState = {
  exercises: seedExercises,
  assignments: seedAssignments,
  announcements: seedAnnouncements,
  attendance: [],
};

const DemoStoreContext = createContext<DemoStore | null>(null);

export function newId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

function readSaved(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    if (!Array.isArray(parsed.exercises) || !Array.isArray(parsed.assignments)) return null;
    return {
      // Exercises saved before descriptions existed get an empty one.
      exercises: parsed.exercises.map((e) => ({ ...e, description: e.description ?? "" })),
      assignments: parsed.assignments,
      // Saved before announcements existed: start from the fictional ones.
      announcements: Array.isArray(parsed.announcements) ? parsed.announcements : seedAnnouncements,
      attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
    };
  } catch {
    return null;
  }
}

function writeSaved(state: DemoState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, blocked). The demo still works for this visit.
  }
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    if (saved) setState(saved);
    setReady(true);
  }, []);

  const update = useCallback((change: (prev: DemoState) => DemoState) => {
    setState((prev) => {
      const next = change(prev);
      writeSaved(next);
      return next;
    });
  }, []);

  const addExercise = useCallback(
    (exercise: Omit<Exercise, "id">) => {
      const created: Exercise = { ...exercise, id: newId("ex") };
      update((prev) => ({ ...prev, exercises: [created, ...prev.exercises] }));
      return created;
    },
    [update],
  );

  const updateExercise = useCallback(
    (id: string, changes: Omit<Exercise, "id">) =>
      update((prev) => ({ ...prev, exercises: prev.exercises.map((e) => (e.id === id ? { ...changes, id } : e)) })),
    [update],
  );

  const replaceAssignments = useCallback(
    (exerciseId: string, next: AssignmentDraft[]) => {
      const today = new Date().toISOString().slice(0, 10);
      update((prev) => {
        const current = prev.assignments.filter((a) => a.exerciseId === exerciseId);
        const kept = prev.assignments.filter((a) => a.exerciseId !== exerciseId);
        const updated = next.map((draft) => {
          const existing = current.find((a) => a.groupId === draft.groupId);
          return { ...draft, id: existing?.id ?? newId("as"), exerciseId, assignedOn: existing?.assignedOn ?? today };
        });
        return { ...prev, assignments: [...kept, ...updated] };
      });
    },
    [update],
  );

  const saveAssignment = useCallback(
    (assignment: Omit<Assignment, "id"> & { id?: string }) => {
      update((prev) => {
        if (assignment.id) {
          return {
            ...prev,
            assignments: prev.assignments.map((a) => (a.id === assignment.id ? { ...a, ...assignment, id: a.id } : a)),
          };
        }
        return { ...prev, assignments: [...prev.assignments, { ...assignment, id: newId("as") }] };
      });
    },
    [update],
  );

  const removeAssignment = useCallback(
    (id: string) => update((prev) => ({ ...prev, assignments: prev.assignments.filter((a) => a.id !== id) })),
    [update],
  );

  const addAnnouncement = useCallback(
    (announcement: Omit<Announcement, "id" | "postedAt">) => {
      const created: Announcement = { ...announcement, id: newId("an"), postedAt: new Date().toISOString() };
      update((prev) => ({ ...prev, announcements: [created, ...prev.announcements] }));
      return created;
    },
    [update],
  );

  const saveAttendance = useCallback(
    (record: Omit<AttendanceRecord, "savedAt">) => {
      const saved: AttendanceRecord = { ...record, savedAt: new Date().toISOString() };
      update((prev) => ({
        ...prev,
        attendance: [saved, ...prev.attendance.filter((r) => r.sessionId !== record.sessionId)],
      }));
    },
    [update],
  );

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(seedState);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      ready,
      addExercise,
      updateExercise,
      replaceAssignments,
      saveAssignment,
      removeAssignment,
      addAnnouncement,
      saveAttendance,
      resetDemo,
    }),
    [
      state,
      ready,
      addExercise,
      updateExercise,
      replaceAssignments,
      saveAssignment,
      removeAssignment,
      addAnnouncement,
      saveAttendance,
      resetDemo,
    ],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const store = useContext(DemoStoreContext);
  if (!store) throw new Error("useDemoStore must be used inside <DemoStoreProvider>");
  return store;
}
