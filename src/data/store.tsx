"use client";

// Demo data store.
// Holds the data the coach can change in the demo: exercises, assignments, announcements,
// attendance, calendar changes, session plans and coach notes, for the active demo scenario
// (D-053). The provider is mounted again whenever the scenario changes.
// Changes are saved in this browser only, per scenario (src/data/persistence.ts). Nothing is
// sent to a server or to other users. The rules live in plain modules (schedule.ts, plans.ts, notes.ts);
// this provider only keeps the state and calls them, so a backend can replace it later.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  Announcement,
  Assignment,
  AttendanceRecord,
  CoachNote,
  Exercise,
  ScheduleChanges,
  SessionPlan,
} from "./types";
import * as exerciseData from "./exercises";
import * as messageData from "./messages";
import * as coachingData from "./coaching";
import { groups } from "./groups";
import { seedAttendance } from "./attendance";
import { activeScenario, activeScenarioId } from "./scenario";
import { NO_CHANGES } from "./calendar";
import { clearDemoState, loadDemoState, onSavedElsewhere, saveDemoState } from "./persistence";
import * as schedule from "./schedule";
import { copyPlan as copyPlanData, newPlan, upsertPlan } from "./plans";
import { saveNote as saveNoteData, type NoteInput } from "./notes";
import { DEFAULT_FEATURES, normaliseFeatures, type FeatureSettings } from "./features";
import { normaliseHidden } from "./calendar-filter";
import { seedSessionPlans } from "./seed-plans";
import { checkSavedState } from "./saved-state";

type DemoState = {
  exercises: Exercise[];
  assignments: Assignment[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
  /** Exceptions and one-off sessions; the weekly slots stay the recurring schedule. */
  schedule: ScheduleChanges;
  /** Session templates and group plans. */
  plans: SessionPlan[];
  notes: CoachNote[];
  /** Optional features switched on or off for the whole demo (D-042). */
  features: FeatureSettings;
  /** Groups hidden in the coach's calendar (D-047); empty shows every group. */
  calendarHiddenGroups: string[];
};

type NewPlanInput = Pick<SessionPlan, "kind" | "title"> & Partial<Pick<SessionPlan, "groupId" | "sessionId">>;

type DemoStore = DemoState & {
  /** False until saved data has been read from this device. */
  ready: boolean;
  addExercise: (exercise: Omit<Exercise, "id">) => Exercise;
  updateExercise: (id: string, changes: Omit<Exercise, "id">) => void;
  /** Replaces all assignments of one exercise (one per group at most). */
  replaceAssignments: (exerciseId: string, next: AssignmentDraft[]) => void;
  saveAssignment: (assignment: Omit<Assignment, "id"> & { id?: string }) => void;
  removeAssignment: (id: string) => void;
  /** Assigns several exercises to a whole group at once (D-059). */
  assignExercisesToGroup: (groupId: string, exerciseIds: string[], instructions: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, "id" | "postedAt">) => Announcement;
  /** Creates or replaces the attendance of one session. */
  saveAttendance: (record: Omit<AttendanceRecord, "savedAt">) => void;
  /** Adds a one-off session and returns its id. */
  createSession: (input: schedule.SessionInput) => string;
  /** Reschedules or changes one session without touching the weekly schedule. */
  updateSession: (id: string, patch: schedule.SessionPatch) => void;
  cancelSession: (id: string, reason?: string) => void;
  restoreSession: (id: string) => void;
  resetSessionToSchedule: (id: string) => void;
  /** Creates an empty template or plan. */
  createPlan: (input: NewPlanInput) => SessionPlan;
  /** Copies a template or plan into a new one; the source is left untouched. */
  copyPlan: (sourceId: string, target: NewPlanInput) => SessionPlan | undefined;
  savePlan: (plan: SessionPlan) => void;
  saveNote: (input: NoteInput) => void;
  /** Shows or hides attendance everywhere. Saved attendance records are never touched. */
  setAttendanceEnabled: (enabled: boolean) => void;
  /** Sets the groups hidden in the coach's calendar. */
  setCalendarHiddenGroups: (ids: string[]) => void;
  resetDemo: () => void;
};

/** One group's assignment as edited in the assign screen. */
export type AssignmentDraft = Pick<Assignment, "groupId" | "audience" | "participantIds" | "customInstructions">;

/** The active scenario's starting data. Attendance history is added in the browser (see below). */
function seedState(): DemoState {
  return {
    exercises: exerciseData.seedExercises,
    assignments: exerciseData.seedAssignments,
    announcements: messageData.seedAnnouncements,
    attendance: [],
    schedule: NO_CHANGES,
    plans: coachingData.seedPlans,
    notes: coachingData.seedNotes,
    features: DEFAULT_FEATURES,
    calendarHiddenGroups: [],
  };
}

/**
 * The seed with three weeks of attendance history and plans for the next sessions. It depends on today's date, so it is only
 * built in the browser after the first render (the server and the first render show none).
 */
function seedWithHistory(): DemoState {
  const { attendanceRate, sessionPlanSeeds } = activeScenario();
  const seed = seedState();
  const now = new Date();
  return {
    ...seed,
    attendance: seedAttendance(groups.map((g) => g.id), now, attendanceRate),
    // Plans prepared for upcoming sessions (D-058).
    plans: [...seed.plans, ...seedSessionPlans(seed.plans, sessionPlanSeeds, now)],
  };
}

const DemoStoreContext = createContext<DemoStore | null>(null);

export function newId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

function readSaved(): DemoState | null {
  const loaded = loadDemoState(activeScenarioId(), seedState(), ["exercises", "assignments"]);
  if (!loaded) return null;
  // Anything malformed (an older version, an edit by hand) falls back to the seed instead of breaking a page (D-069).
  const saved = checkSavedState(loaded, seedState());
  // Exercises saved before descriptions existed get an empty one; saves without settings get the defaults.
  return {
    ...saved,
    exercises: saved.exercises.map((e) => ({ ...e, description: e.description ?? "" })),
    features: normaliseFeatures(saved.features),
    calendarHiddenGroups: normaliseHidden(saved.calendarHiddenGroups),
  };
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  // The provider is keyed by scenario, so the scenario cannot change while it is mounted.
  const [scenario] = useState(activeScenarioId);
  const [state, setState] = useState<DemoState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(readSaved() ?? seedWithHistory());
    setReady(true);
  }, []);

  // Another tab of this browser changed or reset this scenario: show the same data here.
  useEffect(() => onSavedElsewhere(scenario, (what) => what === "state" && setState(readSaved() ?? seedWithHistory())), [scenario]);

  const update = useCallback(
    (change: (prev: DemoState) => DemoState) => {
      setState((prev) => {
        const next = change(prev);
        saveDemoState(scenario, next);
        return next;
      });
    },
    [scenario],
  );

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
      // Merged, so details the form does not edit (objective, coaching points…) are kept.
      update((prev) => ({ ...prev, exercises: prev.exercises.map((e) => (e.id === id ? { ...e, ...changes, id } : e)) })),
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

  const assignExercisesToGroup = useCallback(
    (groupId: string, exerciseIds: string[], instructions: string) => {
      const today = new Date().toISOString().slice(0, 10);
      update((prev) => ({ ...prev, assignments: exerciseData.assignToGroup(prev.assignments, groupId, exerciseIds, instructions, today, () => newId("as")) }));
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

  const createSession = useCallback(
    (input: schedule.SessionInput) => {
      const id = newId("oo");
      update((prev) => ({ ...prev, schedule: schedule.createOneOff(prev.schedule, input, id).changes }));
      return id;
    },
    [update],
  );

  const updateSession = useCallback(
    (id: string, patch: schedule.SessionPatch) =>
      update((prev) => ({ ...prev, schedule: schedule.updateSession(prev.schedule, id, patch) })),
    [update],
  );

  const cancelSession = useCallback(
    (id: string, reason?: string) =>
      update((prev) => ({ ...prev, schedule: schedule.cancelSession(prev.schedule, id, reason) })),
    [update],
  );

  const restoreSession = useCallback(
    (id: string) => update((prev) => ({ ...prev, schedule: schedule.restoreSession(prev.schedule, id) })),
    [update],
  );

  const resetSessionToSchedule = useCallback(
    (id: string) => update((prev) => ({ ...prev, schedule: schedule.resetToSchedule(prev.schedule, id) })),
    [update],
  );

  const createPlan = useCallback(
    (input: NewPlanInput) => {
      const plan = newPlan(input, newId("plan"), new Date().toISOString());
      update((prev) => ({ ...prev, plans: upsertPlan(prev.plans, plan) }));
      return plan;
    },
    [update],
  );

  const copyPlan = useCallback(
    (sourceId: string, target: NewPlanInput) => {
      const source = state.plans.find((p) => p.id === sourceId);
      if (!source) return undefined;
      const plan = copyPlanData(source, target, { plan: newId("plan"), item: () => newId("item") }, new Date().toISOString());
      update((prev) => ({ ...prev, plans: upsertPlan(prev.plans, plan) }));
      return plan;
    },
    [state.plans, update],
  );

  const savePlan = useCallback(
    (plan: SessionPlan) =>
      update((prev) => ({ ...prev, plans: upsertPlan(prev.plans, { ...plan, updatedAt: new Date().toISOString() }) })),
    [update],
  );

  const saveNote = useCallback(
    (input: NoteInput) => update((prev) => ({ ...prev, notes: saveNoteData(prev.notes, input, new Date().toISOString()) })),
    [update],
  );

  const setAttendanceEnabled = useCallback(
    (enabled: boolean) => update((prev) => ({ ...prev, features: { ...prev.features, attendanceEnabled: enabled } })),
    [update],
  );

  const setCalendarHiddenGroups = useCallback(
    (ids: string[]) => update((prev) => ({ ...prev, calendarHiddenGroups: normaliseHidden(ids) })),
    [update],
  );

  const resetDemo = useCallback(() => {
    clearDemoState(scenario);
    setState(seedWithHistory());
  }, [scenario]);

  const value = useMemo(
    () => ({
      ...state,
      ready,
      addExercise,
      updateExercise,
      replaceAssignments,
      saveAssignment,
      removeAssignment,
      assignExercisesToGroup,
      addAnnouncement,
      saveAttendance,
      createSession,
      updateSession,
      cancelSession,
      restoreSession,
      resetSessionToSchedule,
      createPlan,
      copyPlan,
      savePlan,
      saveNote,
      setAttendanceEnabled,
      setCalendarHiddenGroups,
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
      assignExercisesToGroup,
      addAnnouncement,
      saveAttendance,
      createSession,
      updateSession,
      cancelSession,
      restoreSession,
      resetSessionToSchedule,
      createPlan,
      copyPlan,
      savePlan,
      saveNote,
      setAttendanceEnabled,
      setCalendarHiddenGroups,
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

/**
 * Whether attendance is switched on. `enabled` stays false until the saved settings have been
 * read, so a disabled feature never flashes on screen; use `ready` to tell loading from "off".
 */
export function useAttendanceSetting() {
  const { features, ready, setAttendanceEnabled } = useDemoStore();
  return { ready, enabled: ready && features.attendanceEnabled, setEnabled: setAttendanceEnabled };
}
