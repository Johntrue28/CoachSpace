"use client";

import { useId } from "react";
import { useAttendanceSetting } from "@/data/store";
import Badge from "@/components/ui/Badge";

/**
 * The one global switch for attendance tracking (D-042). Turning it off hides every attendance
 * entry point for the coach; saved records stay on this device and come back when it is on again.
 */
export default function AttendanceSwitch({
  className = "",
  showStatus = false,
  onChange,
}: {
  className?: string;
  /** Shows an "Enabled" / "Disabled" label under the description (Settings page). */
  showStatus?: boolean;
  onChange?: (enabled: boolean) => void;
}) {
  const { ready, enabled, setEnabled } = useAttendanceSetting();
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <p id={labelId} className="text-sm font-semibold text-ink">
          Attendance tracking
        </p>
        <p id={descriptionId} className="mt-0.5 text-xs text-ink-soft">
          {!ready
            ? "Turning it off hides attendance everywhere; saved records are kept."
            : enabled
            ? "On for all groups. Turning it off hides attendance everywhere; saved records are kept."
            : "Off for all groups. Saved records are kept and come back when you turn it on."}{" "}
          Demo setting, saved in this browser only.
        </p>
        {showStatus && ready && (
          <Badge tone={enabled ? "brand" : "neutral"} className="mt-2 uppercase tracking-wide">
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        disabled={!ready}
        onClick={() => {
          setEnabled(!enabled);
          onChange?.(!enabled);
        }}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
          enabled ? "bg-brand-strong" : "bg-ink-soft"
        }`}
      >
        <span className="sr-only">{enabled ? "On" : "Off"}</span>
        <span
          aria-hidden
          className={`absolute left-1 h-5 w-5 rounded-full bg-card shadow-card transition-transform ${enabled ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
