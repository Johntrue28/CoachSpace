import type { Assignment } from "@/data/types";
import { participants } from "@/data/groups";

/** Human-readable audience: "Whole group" or the selected participants' names. */
export function audienceLabel(a: Assignment) {
  if (a.audience === "group") return "Whole group";
  const names = a.participantIds
    .map((id) => participants.find((p) => p.id === id)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return "No participants selected";
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
}
