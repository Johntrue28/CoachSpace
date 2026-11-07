"use client";

import { groupAttendanceRate } from "@/data/attendance";
import { useDemoStore } from "@/data/store";

/** "Attendance 84%": a group's season attendance from its saved registers (D-076); nothing before any register. */
export default function GroupRate({ groupId }: { groupId: string }) {
  const { attendance, ready } = useDemoStore();
  const rate = ready ? groupAttendanceRate(attendance, groupId) : null;
  if (rate === null) return null;
  return <span className="tabular-nums">Attendance {rate}%</span>;
}
