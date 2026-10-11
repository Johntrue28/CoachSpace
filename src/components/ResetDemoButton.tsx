"use client";

import { useDemoStore } from "@/data/store";

/** Restores the fictional demo data and removes everything created on this device. */
export default function ResetDemoButton() {
  const { resetDemo } = useDemoStore();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("Reset the demo? Everything you saved on this device (exercises, assignments, announcements, attendance, calendar changes, session plans and notes) will be removed.")) {
          resetDemo();
        }
      }}
      className="w-full text-center text-xs font-semibold text-ink-soft underline"
    >
      Reset demo data
    </button>
  );
}
