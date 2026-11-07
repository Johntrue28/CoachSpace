// Groups, participants and the coach of the active demo scenario (D-053).
// The data itself lives in src/data/scenarios/; these bindings always point to the active
// scenario's data, so every page and rule reads the same, coherent set. Only
// src/data/scenario.ts changes them, and only in the browser: the server always renders the
// default scenario.
import type { Coach, Group, Participant } from "./types";
import { tennis } from "./scenarios/tennis";
import type { ScenarioData } from "./scenarios/types";
import { applyGroupChanges, type GroupChanges } from "./group-admin";
import { groupColour } from "./look";

export let coach: Coach = tennis.coach;

/** The fictional participant used in the demo's participant view. Belongs to two groups. */
export let DEMO_PARTICIPANT_ID = tennis.demoParticipantId;

export let groups: Group[] = tennis.groups;

export let participants: Participant[] = tennis.participants;

/** The active scenario's own groups and participants, before the changes made in the demo (D-072). */
let scenarioGroupData = { groups: tennis.groups, participants: tennis.participants };

export function scenarioGroups() {
  return scenarioGroupData;
}

/** "Coach" or "Instructor", as the active scenario calls the role. */
export function coachRole() {
  return coach.role ?? "Coach";
}

/** "session" or "class" as the active scenario says it, with plural and capitalised forms. */
export function sessionWords() {
  const one = coach.sessionWord ?? "session";
  const many = one === "class" ? "classes" : `${one}s`;
  const cap = (w: string) => w[0].toUpperCase() + w.slice(1);
  return { one, many, One: cap(one), Many: cap(many) };
}

/** Points the bindings above at another scenario. Called by src/data/scenario.ts only. */
export function setGroupData(data: ScenarioData) {
  coach = data.coach;
  DEMO_PARTICIPANT_ID = data.demoParticipantId;
  groups = data.groups;
  participants = data.participants;
  scenarioGroupData = { groups: data.groups, participants: data.participants };
}

/**
 * Shows the groups created, edited and joined in this browser (D-072) on top of the active scenario.
 * Called by the demo store's GroupDataBoundary only.
 */
export function setGroupChanges(changes: GroupChanges) {
  const next = applyGroupChanges(scenarioGroupData.groups, scenarioGroupData.participants, changes);
  groups = next.groups;
  participants = next.participants;
}

/** The sports of the active scenario, for the group form. */
export function scenarioDisciplines() {
  return [...new Set(scenarioGroupData.groups.map((g) => g.discipline))];
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

/**
 * A short code for a group in tight spaces (D-061): its own `short`, or the first character of up
 * to three words, keeping numbers whole ("U16 Development" → "U16D", "Adult Improvers" → "AI").
 */
export function groupCode(id: string) {
  const group = groupById(id);
  if (!group) return "";
  if (group.short) return group.short;
  return group.name
    .split(/[\s—-]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => (/^[A-Z]?\d+$/i.test(w) ? w.toUpperCase() : w[0].toUpperCase()))
    .join("");
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

/**
 * People against group memberships (audit F-06): one person in two groups is one person but two
 * memberships, so group sizes add up to more than the number of people.
 */
export function peopleSummary() {
  const people = uniqueParticipantCount();
  const perPerson = new Map<string, number>();
  for (const p of participants) perPerson.set(p.id, (perPerson.get(p.id) ?? 0) + 1);
  const inSeveral = [...perPerson.values()].filter((n) => n > 1).length;
  return { people, memberships: participants.length, inSeveral };
}

/** "1 person is in two groups" / "2 people are in more than one group", or "" when nobody is. */
export function severalGroupsText(inSeveral: number) {
  if (inSeveral === 0) return "";
  return inSeveral === 1 ? "1 person is in more than one group" : `${inSeveral} people are in more than one group`;
}

export function participantsOf(groupId: string) {
  return participants.filter((p) => p.groupId === groupId);
}

export function memberCount(groupId: string) {
  return participantsOf(groupId).length;
}

/** "1 participant", "6 participants": a group can now have any size (D-072). */
export function participantsLabel(n: number) {
  return `${n} ${n === 1 ? "participant" : "participants"}`;
}

/** A group's colour (D-074), the same on every screen: by its position among the active groups. */
export function colourOf(groupId: string) {
  return groupColour(groupId, groups.map((g) => g.id));
}

/** The sport of a group, or of the first group (for photos). */
export function disciplineOf(groupId: string) {
  return (groupById(groupId) ?? groups[0]).discipline;
}
