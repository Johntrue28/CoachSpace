// Groups, participants and the coach of the active demo scenario (D-053).
// The data itself lives in src/data/scenarios/; these bindings always point to the active
// scenario's data, so every page and rule reads the same, coherent set. Only
// src/data/scenario.ts changes them, and only in the browser: the server always renders the
// default scenario.
import type { Coach, Group, Participant } from "./types";
import { tennis } from "./scenarios/tennis";
import type { ScenarioData } from "./scenarios/types";

export let coach: Coach = tennis.coach;

/** The fictional participant used in the demo's participant view. Belongs to two groups. */
export let DEMO_PARTICIPANT_ID = tennis.demoParticipantId;

export let groups: Group[] = tennis.groups;

export let participants: Participant[] = tennis.participants;

/** "Coach" or "Instructor", as the active scenario calls the role. */
export function coachRole() {
  return coach.role ?? "Coach";
}

/** Points the bindings above at another scenario. Called by src/data/scenario.ts only. */
export function setGroupData(data: ScenarioData) {
  coach = data.coach;
  DEMO_PARTICIPANT_ID = data.demoParticipantId;
  groups = data.groups;
  participants = data.participants;
}

export function groupById(id: string) {
  return groups.find((g) => g.id === id);
}

const weekdayShort = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "Mon & Wed · 18:00", built from the group's weekly slots. */
export function scheduleLabel(group: Group) {
  const days = group.slots.map((s) => weekdayShort[s.weekday]).join(" & ");
  const times = [...new Set(group.slots.map((s) => s.time))].join(" / ");
  return `${days} · ${times}`;
}

export function groupName(id: string) {
  return groupById(id)?.name ?? "";
}

/** A participant's first membership (for their name and main group). */
export function participantById(id: string) {
  return participants.find((p) => p.id === id);
}

/** Ids of all the groups a participant belongs to. */
export function groupIdsOf(participantId: string) {
  return participants.filter((p) => p.id === participantId).map((p) => p.groupId);
}

/** Number of different people across all groups. */
export function uniqueParticipantCount() {
  return new Set(participants.map((p) => p.id)).size;
}

export function participantsOf(groupId: string) {
  return participants.filter((p) => p.groupId === groupId);
}

export function memberCount(groupId: string) {
  return participantsOf(groupId).length;
}
