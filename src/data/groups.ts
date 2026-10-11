// Fictional demo data. Will be replaced by a real data source in a later phase.
import type { Coach, Group } from "./types";

export const coach: Coach = {
  name: "Laura Gomez",
  organisation: "Harbour Sports Academy",
};

export const groups: Group[] = [
  { id: "g1", name: "U12 Football", discipline: "Football", members: 16, unread: 3 },
  { id: "g2", name: "Senior Basketball", discipline: "Basketball", members: 12, unread: 0 },
  { id: "g3", name: "Junior Tennis", discipline: "Tennis", members: 8, unread: 5 },
  { id: "g4", name: "Morning Pilates", discipline: "Pilates", members: 10, unread: 1 },
];

export function groupName(id: string) {
  return groups.find((g) => g.id === id)?.name ?? "";
}
