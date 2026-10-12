"use client";

import { useAttendanceSetting } from "@/data/store";

/** Renders its children only while attendance is switched on (D-042). */
export default function AttendanceOnly({ children }: { children: React.ReactNode }) {
  const { enabled } = useAttendanceSetting();
  return enabled ? <>{children}</> : null;
}
