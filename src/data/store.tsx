"use client";

// Demo data store.
// Holds the data the coach can change in the demo (exercises and assignments).
// Changes are saved in this browser only (localStorage). Nothing is sent to a server
// or to other users. In a later phase this will be replaced by a real backend.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Assignment, Exercise } from "./types";
import { seedAssignments, seedExercises } from "./exercises";

const STORAGE_KEY = "coachspace-demo-v1";

type DemoState = {
  exercises: Exercise[];
  assignments: Assignment[];
};

type DemoStore = DemoState & {
  /** False until saved data has been read from this device. */
  ready: boolean;
  addExercise: (exercise: Omit<Exercise, "id">) => Exercise;
  saveAssignment: (assignment: Omit<Assignment, "id"> & { id?: string }) => void;
  removeAssignment: (id: string) => void;
  resetDemo: () => void;
};

const seedState: DemoState = { exercises: seedExercises, assignments: seedAssignments };

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
    return { exercises: parsed.exercises, assignments: parsed.assignments };
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

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(seedState);
  }, []);

  const value = useMemo(
    () => ({ ...state, ready, addExercise, saveAssignment, removeAssignment, resetDemo }),
    [state, ready, addExercise, saveAssignment, removeAssignment, resetDemo],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const store = useContext(DemoStoreContext);
  if (!store) throw new Error("useDemoStore must be used inside <DemoStoreProvider>");
  return store;
}
