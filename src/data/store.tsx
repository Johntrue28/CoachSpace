"use client";

// Demo data store.
// Holds the data the coach can change in the demo: exercises, assignments, announcements,
// attendance, calendar changes, session plans, coach notes and group changes, for the active demo scenario
// (D-053). The provider is mounted again whenever the scenario changes.
// Changes are saved in this browser only, per scenario (src/data/persistence.ts). Nothing is
// sent to a server or to other users. The rules live in plain modules (schedule.ts, plans.ts, notes.ts);
// this provider only keeps the state and calls them, so a backend can replace it later.

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { DEMO_PARTICIPANT_ID, groupIdsOf, groups, participants, scenarioGroups, setGroupChanges } from "./groups";
import {
  NO_GROUP_CHANGES,
  addMember as addMemberData,
  createGroup as createGroupData,
  editGroup,
  nextId,
  groupChangesKey,
  normaliseGroupChanges,
  type GroupChanges,
  type GroupDraft,
  type MemberDraft,
} from "./group-admin";
import { rosterFor, seedAttendance } from "./attendance";
import { activeScenario, activeScenarioId } from "./scenario";
import { NO_CHANGES, toDateKey, upcomingSessions } from "./calendar";
import { clearDemoState, loadDemoState, onSavedElsewhere, saveDemoState } from "./persistence";
import * as schedule from "./schedule";
import { duplicatePlan as duplicatePlanData, migrateSavedPlans, newPlan, setPlanSessions as setPlanSessionsData, upsertPlan } from "./plans";
import { saveNote as saveNoteData, type NoteInput } from "./notes";
import { normaliseHidden } from "./calendar-filter";
import { seedSessionPlans } from "./seed-plans";
import { checkSavedState } from "./saved-state";
import { normaliseHiddenPins, type PinViewer } from "./pinned";
import { NO_LIFTS, normaliseLifts, seedLifts, type Lifts } from "./lifts";
import { normaliseReminders, normaliseRsvpChanges, setAnswer, type RsvpAnswer, type RsvpChanges } from "./rsvp";

type DemoState = {
  exercises: Exercise[];
  assignments: Assignment[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
  /** Exceptions and one-off sessions; the weekly slots stay the recurring schedule. */
  schedule: ScheduleChanges;
  /** The coach's plans, each used in any number of sessions (D-076). */
  plans: SessionPlan[];
  notes: CoachNote[];
  /** Groups hidden in the coach's calendar (D-047); empty shows every group. */
  calendarHiddenGroups: string[];
  /** "Are you coming?" answers given in this browser, on top of the seeded ones (D-071). */
  rsvp: RsvpChanges;
  /** When the coach last prepared a reminder for a session's non-responders (demo, never sent). */
  rsvpReminders: Record<string, string>;
  /** Groups created or edited and members added in this browser (D-072). */
  groupChanges: GroupChanges;
  /** The pinned announcement each viewer closed on Home (D-076), hidden until a newer one is posted. */
  hiddenPins: Partial<Record<PinViewer, string>>;
  /** Lifts (carpool) offered and asked for per session (D-076), saved in this browser; nobody is notified. */
  lifts: Lifts;
};

type NewPlanInput = Pick<SessionPlan, "title"> & Partial<Pick<SessionPlan, "groupId">>;

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
  /** Adds a one-off session and returns its id. */
  createSession: (input: schedule.SessionInput) => string;
  /** Reschedules or changes one session without touching the weekly schedule. */
  updateSession: (id: string, patch: schedule.SessionPatch) => void;
  cancelSession: (id: string, reason?: string) => void;
  restoreSession: (id: string) => void;
  resetSessionToSchedule: (id: string) => void;
  /** Creates an empty plan. */
  createPlan: (input: NewPlanInput) => SessionPlan;
  /** "Duplicate": a copy of a plan to adapt; the source is left untouched. */
  duplicatePlan: (sourceId: string) => SessionPlan | undefined;
  /** "Use in session": the plan is used in exactly these sessions (taken off any other plan). */
  setPlanSessions: (planId: string, sessionIds: string[]) => void;
  savePlan: (plan: SessionPlan) => void;
  saveNote: (input: NoteInput) => void;
  /** Sets the groups hidden in the coach's calendar. */
  setCalendarHiddenGroups: (ids: string[]) => void;
  /** Records a member's answer for a session, or removes it with `null` (D-071). */
  setRsvp: (sessionId: string, participantId: string, answer: RsvpAnswer | null) => void;
  /** Notes that a reminder was prepared for a session's non-responders. Nothing is sent (demo). */
  markReminded: (sessionId: string) => void;
  /** Creates a group from the group form and returns its id. Nobody is invited (demo). */
  createGroup: (draft: GroupDraft) => string;
  /** Saves the group form for an existing group. */
  updateGroup: (id: string, draft: GroupDraft) => void;
  /** Adds a member to a group and returns their id. Nobody is told (demo). */
  addMember: (groupId: string, draft: MemberDraft) => string;
  /** Closes the pinned announcement on a viewer's Home. */
  hidePin: (viewer: PinViewer, announcementId: string) => void;
  /** Applies one of the lift rules of src/data/lifts.ts (offer, join, leave, ask, take…). */
  updateLifts: (change: (lifts: Lifts) => Lifts) => void;
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
    calendarHiddenGroups: [],
    rsvp: {},
    rsvpReminders: {},
    groupChanges: NO_GROUP_CHANGES,
    hiddenPins: {},
    lifts: NO_LIFTS,
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
    plans: seedSessionPlans(seed.plans, sessionPlanSeeds, now),
    lifts: seedLifts(liftSessions(now)),
  };
}

/**
 * Sessions with example lifts (D-076): the next session of the first group and of the demo player's first group.
 * The demo player is left out of the example cars, so they can still offer, join or ask.
 */
function liftSessions(now: Date) {
  const groupIds = [...new Set([groups[0]?.id, groupIdsOf(DEMO_PARTICIPANT_ID)[0]].filter((id): id is string => Boolean(id)))];
  return groupIds.flatMap((groupId) => {
    const next = upcomingSessions(now, { limit: 1, groupId, activeOnly: true })[0];
    return next ? [{ id: next.id, time: next.time, memberIds: rosterFor(groupId).map((p) => p.id).filter((id) => id !== DEMO_PARTICIPANT_ID) }] : [];
  });
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
  const saved = checkSavedState({ ...loaded, plans: migrateSavedPlans(loaded.plans) }, seedState());
  // Exercises saved before descriptions existed get an empty one; saves without settings get the defaults.
  return {
    ...saved,
    exercises: saved.exercises.map((e) => ({ ...e, description: e.description ?? "" })),
    calendarHiddenGroups: normaliseHidden(saved.calendarHiddenGroups),
    rsvp: normaliseRsvpChanges(saved.rsvp),
    rsvpReminders: normaliseReminders(saved.rsvpReminders),
    groupChanges: normaliseGroupChanges(saved.groupChanges),
    hiddenPins: normaliseHiddenPins(saved.hiddenPins),
    lifts: normaliseLifts(saved.lifts),
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

  const duplicatePlan = useCallback(
    (sourceId: string) => {
      const source = state.plans.find((p) => p.id === sourceId);
      if (!source) return undefined;
      const plan = duplicatePlanData(source, { plan: newId("plan"), item: () => newId("item") }, new Date().toISOString());
      update((prev) => ({ ...prev, plans: upsertPlan(prev.plans, plan) }));
      return plan;
    },
    [state.plans, update],
  );

  const setPlanSessions = useCallback(
    (planId: string, sessionIds: string[]) => update((prev) => ({ ...prev, plans: setPlanSessionsData(prev.plans, planId, sessionIds) })),
    [update],
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

  const setCalendarHiddenGroups = useCallback(
    (ids: string[]) => update((prev) => ({ ...prev, calendarHiddenGroups: normaliseHidden(ids) })),
    [update],
  );

  const setRsvp = useCallback(
    (sessionId: string, participantId: string, answer: RsvpAnswer | null) =>
      update((prev) => ({ ...prev, rsvp: setAnswer(prev.rsvp, sessionId, participantId, answer) })),
    [update],
  );

  const markReminded = useCallback(
    (sessionId: string) =>
      update((prev) => ({ ...prev, rsvpReminders: { ...prev.rsvpReminders, [sessionId]: new Date().toISOString() } })),
    [update],
  );

  const createGroup = useCallback(
    (draft: GroupDraft) => {
      // Ids are worked out from the scenario and the saved changes, so they never repeat.
      const ids = [...scenarioGroups().groups.map((g) => g.id), ...state.groupChanges.created.map((g) => g.id)];
      const id = nextId("ng", ids);
      update((prev) => ({ ...prev, groupChanges: createGroupData(prev.groupChanges, draft, { id, today: toDateKey(new Date()) }).changes }));
      return id;
    },
    [state.groupChanges, update],
  );

  const updateGroup = useCallback(
    (id: string, draft: GroupDraft) => update((prev) => ({ ...prev, groupChanges: editGroup(prev.groupChanges, id, draft) })),
    [update],
  );

  const addMember = useCallback(
    (groupId: string, draft: MemberDraft) => {
      const id = nextId("m", [...participants.map((p) => p.id), ...state.groupChanges.members.map((m) => m.id)]);
      update((prev) => ({ ...prev, groupChanges: addMemberData(prev.groupChanges, groupId, draft, { id, today: toDateKey(new Date()) }).changes }));
      return id;
    },
    [state.groupChanges, update],
  );

  const hidePin = useCallback(
    (viewer: PinViewer, announcementId: string) => update((prev) => ({ ...prev, hiddenPins: { ...prev.hiddenPins, [viewer]: announcementId } })),
    [update],
  );

  const updateLifts = useCallback((change: (lifts: Lifts) => Lifts) => update((prev) => ({ ...prev, lifts: change(prev.lifts) })), [update]);

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
      addAnnouncement,
      saveAttendance,
      createSession,
      updateSession,
      cancelSession,
      restoreSession,
      resetSessionToSchedule,
      createPlan,
      duplicatePlan,
      setPlanSessions,
      savePlan,
      saveNote,
      setCalendarHiddenGroups,
      setRsvp,
      markReminded,
      createGroup,
      updateGroup,
      addMember,
      hidePin,
      updateLifts,
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
      createSession,
      updateSession,
      cancelSession,
      restoreSession,
      resetSessionToSchedule,
      createPlan,
      duplicatePlan,
      setPlanSessions,
      savePlan,
      saveNote,
      setCalendarHiddenGroups,
      setRsvp,
      markReminded,
      createGroup,
      updateGroup,
      addMember,
      hidePin,
      updateLifts,
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
 * Shows the groups created, edited and joined in this browser everywhere (D-072). Every page reads
 * the active groups from src/data/groups.ts, so the changes are applied there and the pages inside
 * are mounted again when they change, as the scenario provider does when the scenario changes.
 * Placed inside the navigation provider, so back links and confirmation messages are kept.
 */
export function GroupDataBoundary({ children }: { children: React.ReactNode }) {
  const { groupChanges } = useDemoStore();
  const key = useMemo(() => {
    setGroupChanges(groupChanges);
    return groupChangesKey(groupChanges);
  }, [groupChanges]);
  return <Fragment key={key}>{children}</Fragment>;
}
