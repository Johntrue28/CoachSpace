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

// The <Suspense> fallbacks come from this module too, so the fallback and the screen that replaces
// it load together: a form shown as a fallback is never swapped for a fresh one while in use.
export function AttendanceStartFallback() {
  return <AttendanceStart />;
}

export function SessionAttendanceFallback({ sessionId }: { sessionId: string }) {
  return <AttendanceForm sessionId={sessionId} />;
}
