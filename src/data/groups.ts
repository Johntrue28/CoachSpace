// Fictional demo data. Will be replaced by a real data source in a later phase.
import type { Coach, Group, Participant } from "./types";

export const coach: Coach = {
  name: "Laura Gomez",
  organisation: "Harbour Sports Academy",
};

export const groups: Group[] = [
  {
    id: "g1",
    name: "U12 Football",
    discipline: "Football",
    description: "Under-12 squad focused on technique, small-sided games and teamwork.",
    slots: [
      { weekday: 1, time: "18:00", durationMin: 75 },
      { weekday: 3, time: "18:00", durationMin: 75 },
    ],
    venue: "Pitch 2",
    unread: 3,
  },
  {
    id: "g2",
    name: "Senior Basketball",
    discipline: "Basketball",
    description: "Adult competitive team training for the regional league.",
    slots: [
      { weekday: 2, time: "19:30", durationMin: 90 },
      { weekday: 4, time: "19:30", durationMin: 90 },
    ],
    venue: "Main hall",
    unread: 0,
  },
  {
    id: "g3",
    name: "Junior Tennis",
    discipline: "Tennis",
    description: "Small-group coaching for juniors aged 12–15.",
    slots: [
      { weekday: 3, time: "17:30", durationMin: 60 },
      { weekday: 5, time: "17:30", durationMin: 60 },
    ],
    venue: "Court 3",
    unread: 5,
  },
  {
    id: "g4",
    name: "Morning Pilates",
    discipline: "Pilates",
    description: "Mat Pilates class for adults focusing on core strength and mobility.",
    slots: [
      { weekday: 2, time: "08:30", durationMin: 55 },
      { weekday: 4, time: "08:30", durationMin: 55 },
    ],
    venue: "Studio A",
    unread: 1,
  },
];

export const participants: Participant[] = [
  // U12 Football
  { id: "p01", groupId: "g1", name: "Leo Martin", detail: "Goalkeeper", joined: "Sep 2025" },
  { id: "p02", groupId: "g1", name: "Noah Ruiz", detail: "Defender", joined: "Sep 2025" },
  { id: "p03", groupId: "g1", name: "Mia Torres", detail: "Defender", joined: "Jan 2026" },
  { id: "p04", groupId: "g1", name: "Lucas Navarro", detail: "Midfielder", joined: "Sep 2025" },
  { id: "p05", groupId: "g1", name: "Ella Romero", detail: "Midfielder", joined: "Sep 2024" },
  { id: "p06", groupId: "g1", name: "Hugo Serrano", detail: "Midfielder", joined: "Mar 2026" },
  { id: "p07", groupId: "g1", name: "Sofia Molina", detail: "Forward", joined: "Sep 2024" },
  { id: "p08", groupId: "g1", name: "Dani Ortega", detail: "Forward", joined: "Sep 2025" },
  { id: "p09", groupId: "g1", name: "Oliver Castro", detail: "Defender", joined: "Sep 2025" },
  { id: "p10", groupId: "g1", name: "Alba Vidal", detail: "Midfielder", joined: "Jan 2026" },
  // Senior Basketball
  { id: "p11", groupId: "g2", name: "Marcus Reid", detail: "Point guard", joined: "Sep 2023" },
  { id: "p12", groupId: "g2", name: "Jordan Hale", detail: "Shooting guard", joined: "Sep 2024" },
  { id: "p13", groupId: "g2", name: "Sam Okafor", detail: "Small forward", joined: "Sep 2023" },
  { id: "p14", groupId: "g2", name: "Chris Duval", detail: "Power forward", joined: "Jan 2025" },
  { id: "p15", groupId: "g2", name: "Tom Becker", detail: "Centre", joined: "Sep 2024" },
  { id: "p16", groupId: "g2", name: "Andre Silva", detail: "Guard", joined: "Sep 2025" },
  { id: "p17", groupId: "g2", name: "Ryan Moss", detail: "Forward", joined: "Sep 2025" },
  { id: "p18", groupId: "g2", name: "Ben Carter", detail: "Centre", joined: "Mar 2026" },
  // Junior Tennis
  { id: "p19", groupId: "g3", name: "Chloe Bennett", detail: "Intermediate", joined: "Sep 2024" },
  { id: "p20", groupId: "g3", name: "Ethan Price", detail: "Beginner", joined: "Jan 2026" },
  { id: "p21", groupId: "g3", name: "Isla Ward", detail: "Advanced", joined: "Sep 2023" },
  { id: "p22", groupId: "g3", name: "Max Fischer", detail: "Intermediate", joined: "Sep 2025" },
  { id: "p23", groupId: "g3", name: "Ava Rossi", detail: "Intermediate", joined: "Sep 2025" },
  { id: "p24", groupId: "g3", name: "Liam Shaw", detail: "Beginner", joined: "Mar 2026" },
  // Morning Pilates
  { id: "p25", groupId: "g4", name: "Helen Price", detail: "Regular", joined: "Jan 2025" },
  { id: "p26", groupId: "g4", name: "Grace Lin", detail: "Regular", joined: "Sep 2024" },
  { id: "p27", groupId: "g4", name: "Paula Ferrer", detail: "New", joined: "Sep 2026" },
  { id: "p28", groupId: "g4", name: "Kate Moreno", detail: "Regular", joined: "Jan 2026" },
  { id: "p29", groupId: "g4", name: "Diana Cruz", detail: "Returning after injury", joined: "Sep 2025" },
  { id: "p30", groupId: "g4", name: "Ruth Evans", detail: "Regular", joined: "Mar 2025" },
  { id: "p31", groupId: "g4", name: "Nina Patel", detail: "New", joined: "Sep 2026" },
  // Jordan Hale also attends Pilates for mobility work (same person, two groups).
  { id: "p12", groupId: "g4", name: "Jordan Hale", detail: "Mobility work", joined: "Jan 2026" },
];

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
