import type { Assignment } from "@/data/types";
import { participants } from "@/data/groups";
import { t } from "@/i18n";

/** Human-readable audience: "Whole group" or the selected participants' names. */
export function audienceLabel(a: Assignment) {
  if (a.audience === "group") return t("audience.wholeGroup");
  const names = a.participantIds
    .map((id) => participants.find((p) => p.id === id)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return t("audience.nobody");
  if (names.length === 1) return names[0];
  if (names.length === 2) return t("audience.and", { a: names[0], b: names[1] });
  return t("audience.andMore", { names: names.slice(0, 2).join(", "), count: names.length - 2 });
}
