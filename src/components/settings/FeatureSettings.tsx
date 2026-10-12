"use client";

import { useState } from "react";
import AttendanceSwitch from "@/components/attendance/AttendanceSwitch";
import StatusMessage from "@/components/ui/StatusMessage";

/** The Features section of Settings: the global attendance switch (D-042) with a confirmation. */
export default function FeatureSettings() {
  const [changed, setChanged] = useState<boolean | null>(null);
  return (
    <>
      {changed !== null && (
        <StatusMessage className="mt-4">
          {changed
            ? "Attendance tracking is on. Its navigation, summaries and actions are back."
            : "Attendance tracking is off. Saved attendance records are kept."}
        </StatusMessage>
      )}
      <AttendanceSwitch showStatus onChange={setChanged} className="mt-6 border-t border-line pt-6" />
    </>
  );
}
