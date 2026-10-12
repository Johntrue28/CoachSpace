// Calendar group filter (D-047). Pure, no React (unit tested).
// The demo store saves the groups the coach has hidden, not the ones shown, so a group added later
// is shown by default and an id that no longer exists is simply ignored. Group ids, never names.

export type GroupSelection = "all" | "some" | "none";

/** The ids of the groups to show, in the order of `allIds`. */
export function visibleGroupIds(allIds: string[], hidden: string[]) {
  return allIds.filter((id) => !hidden.includes(id));
}

/** Whether every group, some groups or no group is shown. Unknown hidden ids do not count. */
export function selectionState(allIds: string[], hidden: string[]): GroupSelection {
  const shown = visibleGroupIds(allIds, hidden).length;
  if (shown === allIds.length) return "all";
  return shown === 0 ? "none" : "some";
}

/** Shows a hidden group or hides a shown one. */
export function toggleGroup(allIds: string[], hidden: string[], id: string) {
  const known = normaliseHidden(hidden, allIds);
  return known.includes(id) ? known.filter((h) => h !== id) : [...known, id];
}

/** Hidden ids that show every group. */
export const SHOW_ALL: string[] = [];

/** Hidden ids that show no group. */
export function hideAll(allIds: string[]) {
  return [...allIds];
}

/** Hidden ids that show only `id` (used by a group's "View sessions"). Unknown ids show every group. */
export function onlyGroup(allIds: string[], id: string) {
  return allIds.includes(id) ? allIds.filter((g) => g !== id) : SHOW_ALL;
}

/** Saved hidden ids, cleaned: strings only, no duplicates, and (when given) only existing groups. */
export function normaliseHidden(saved: unknown, allIds?: string[]): string[] {
  if (!Array.isArray(saved)) return [];
  const ids = saved.filter((v): v is string => typeof v === "string");
  return [...new Set(ids)].filter((id) => !allIds || allIds.includes(id));
}
