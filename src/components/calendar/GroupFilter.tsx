"use client";

import { useEffect, useId, useRef } from "react";
import { groups } from "@/data/groups";
import { SHOW_ALL, hideAll, selectionState, toggleGroup, visibleGroupIds } from "@/data/calendar-filter";
import { ChevronDownIcon, UsersIcon } from "@/components/Icons";
import { buttonClass } from "@/components/ui/Button";
import { t } from "@/i18n";

const allIds = groups.map((g) => g.id);
const nameOf = (id: string) => groups.find((g) => g.id === id)?.name ?? id;

/** Short text for the filter button: "All groups", "U12 Football", "2 of 4 groups" or "No groups". */
export function filterSummary(hidden: string[]) {
  const shown = visibleGroupIds(allIds, hidden);
  const state = selectionState(allIds, hidden);
  if (state === "all") return t("filter.all");
  if (state === "none") return t("filter.none");
  return shown.length === 1 ? nameOf(shown[0]) : t("filter.some", { count: shown.length, total: allIds.length });
}

/** The "Groups" button of the calendar toolbar; opens the panel below the toolbar. */
export function GroupFilterButton({
  hidden,
  open,
  onToggle,
  panelId,
}: {
  hidden: string[];
  open: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  const filtered = selectionState(allIds, hidden) !== "all";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      className={buttonClass({
        variant: "secondary",
        size: "sm",
        className: `max-w-full ${filtered ? "ring-2 ring-brand" : ""}`,
      })}
    >
      <UsersIcon className="h-4 w-4 shrink-0 text-ink-soft" />
      <span className="truncate">
        <span className="sr-only">{t("filter.shown")} </span>
        {filterSummary(hidden)}
      </span>
      <ChevronDownIcon className={`h-4 w-4 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

/**
 * Calendar group filter (D-047): "All groups" plus one checkbox per group, "Clear all" and "Done".
 * Changes apply at once and are saved in this browser. Escape closes it and returns focus.
 */
export function GroupFilterPanel({
  id,
  hidden,
  onChange,
  onClose,
}: {
  id: string;
  hidden: string[];
  onChange: (hidden: string[]) => void;
  onClose: () => void;
}) {
  const state = selectionState(allIds, hidden);
  const allBox = useRef<HTMLInputElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (allBox.current) allBox.current.indeterminate = state === "some";
  }, [state]);

  useEffect(() => {
    allBox.current?.focus();
  }, []);

  const pill = "flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-card px-3 text-sm font-semibold text-ink ring-1 ring-line hover:ring-brand/40 has-[:checked]:bg-brand-soft has-[:checked]:text-brand-strong has-[:checked]:ring-brand";
  const box = "h-4 w-4 shrink-0 accent-brand-strong";

  return (
    <div
      id={id}
      role="group"
      aria-labelledby={headingId}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      className="mb-4 rounded-card bg-card p-4 shadow-card ring-1 ring-line"
    >
      <p id={headingId} className="text-sm font-bold text-ink">
        {t("filter.panel")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className={pill}>
          <input
            ref={allBox}
            type="checkbox"
            className={box}
            checked={state === "all"}
            onChange={() => onChange(state === "all" ? hideAll(allIds) : SHOW_ALL)}
          />
          {t("filter.all")}
        </label>
        {groups.map((g) => (
          <label key={g.id} className={pill}>
            <input
              type="checkbox"
              className={box}
              checked={!hidden.includes(g.id)}
              onChange={() => onChange(toggleGroup(allIds, hidden, g.id))}
            />
            {g.name}
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <p className="text-xs text-ink-soft">{t("filter.saved")}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => onChange(hideAll(allIds))} disabled={state === "none"} className={buttonClass({ variant: "ghost", size: "sm" })}>
            {t("filter.clear")}
          </button>
          <button type="button" onClick={onClose} className={buttonClass({ variant: "secondary", size: "sm" })}>
            {t("filter.done")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** What is shown while some groups are hidden: removable chips, or the empty state when none is left. */
export function GroupFilterSummary({ hidden, onChange }: { hidden: string[]; onChange: (hidden: string[]) => void }) {
  const state = selectionState(allIds, hidden);
  if (state === "all") return null;
  if (state === "none") {
    return (
      <div role="status" className="mb-4 flex flex-col gap-3 rounded-card border border-dashed border-line-strong bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">{t("filter.noneTitle")}</p>
          <p className="text-sm text-ink-soft">{t("filter.noneHint")}</p>
        </div>
        <button type="button" onClick={() => onChange(SHOW_ALL)} className={buttonClass({ size: "sm", className: "self-start sm:self-auto" })}>
          {t("filter.showAll")}
        </button>
      </div>
    );
  }
  const shown = visibleGroupIds(allIds, hidden);
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label={t("filter.chips")} role="group">
      <span className="text-sm text-ink-soft">{t("filter.showing")}</span>
      {shown.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(toggleGroup(allIds, hidden, id))}
          aria-label={t("filter.hide", { name: nameOf(id) })}
          className="inline-flex min-h-8 items-center gap-1 rounded-full bg-brand-soft px-3 text-sm font-semibold text-brand-strong hover:ring-1 hover:ring-brand"
        >
          {nameOf(id)} <span aria-hidden>✕</span>
        </button>
      ))}
      <button type="button" onClick={() => onChange(SHOW_ALL)} className="text-sm font-semibold text-brand-strong hover:underline">
        {t("filter.showAll")}
      </button>
    </div>
  );
}
