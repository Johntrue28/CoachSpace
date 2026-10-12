import { Suspense } from "react";
import AttendanceStart from "@/components/attendance/AttendanceStart";
import { AttendanceStartRoute } from "@/components/attendance/AttendanceRoutes";

export const metadata = { title: "Take attendance · CoachSpace" };

/** Built in advance; `?group=` is read in the browser (D-054). */
export default function AttendanceStartPage() {
  return (
    <Suspense fallback={<AttendanceStart />}>
      <AttendanceStartRoute />
    </Suspense>
  );
}
