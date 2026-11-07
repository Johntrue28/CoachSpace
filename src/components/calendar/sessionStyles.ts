import type { SessionState } from "@/data/calendar";
import { t } from "@/i18n";

// Calendar colours by session state (D-045), using the palette's meanings (D-041): the calendar
// blue for regular sessions, brand green for extra sessions, amber for changes, rose for cancelled.

/** Small labels in the month grid. */
export const stateChip: Record<SessionState, string> = {
  regular: "bg-info-soft text-info",
  extra: "bg-brand-soft text-brand-strong",
  changed: "bg-attention-soft text-attention-ink",
  cancelled: "bg-danger-soft text-danger line-through",
};

/** Left border of the session cards in the week view and the day's list. */
export const stateAccent: Record<SessionState, string> = {
  regular: "border-info",
  extra: "border-brand",
  changed: "border-attention",
  cancelled: "border-danger",
};

/** Times on white cards. */
export const stateText: Record<SessionState, string> = {
  regular: "text-info",
  extra: "text-brand-strong",
  changed: "text-attention-ink",
  cancelled: "text-danger",
};

export const stateKey: { state: SessionState; label: string; dot: string }[] = [
  { state: "regular", get label() { return t("session.keySession"); }, dot: "bg-info" },
  { state: "extra", get label() { return t("session.keyExtra"); }, dot: "bg-brand" },
  { state: "changed", get label() { return t("session.keyChanged"); }, dot: "bg-attention" },
  { state: "cancelled", get label() { return t("session.keyCancelled"); }, dot: "bg-danger" },
];
