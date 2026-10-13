import { Suspense } from "react";
import { AttendanceStartFallback, AttendanceStartRoute } from "@/components/attendance/AttendanceRoutes";

export const metadata = { title: "Take attendance · CoachSpace" };

/** Built in advance; `?group=` is read in the browser (D-054). */
export default function AttendanceStartPage() {
  return (
    <Suspense fallback={<AttendanceStartFallback />}>
      <AttendanceStartRoute />
    </Suspense>
  );
}
