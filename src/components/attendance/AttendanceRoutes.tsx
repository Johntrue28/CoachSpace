"use client";

import { useSearchParams } from "next/navigation";
import AttendanceStart from "./AttendanceStart";
import AttendanceForm from "./AttendanceForm";

/** Take attendance: reads `?group=` in the browser so the page can be built in advance (D-054). */
export function AttendanceStartRoute() {
  return <AttendanceStart groupId={useSearchParams().get("group") ?? undefined} />;
}

/** Attendance for one session; `?group=` is the group the coach came from. */
export function SessionAttendanceRoute({ sessionId }: { sessionId: string }) {
  return <AttendanceForm sessionId={sessionId} groupId={useSearchParams().get("group") ?? undefined} />;
}
