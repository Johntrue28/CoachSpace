import { Suspense } from "react";
import AttendanceForm from "@/components/attendance/AttendanceForm";
import { SessionAttendanceRoute } from "@/components/attendance/AttendanceRoutes";

export const metadata = { title: "Attendance · CoachSpace" };

/** Sessions are checked in the browser: they depend on the date, the scenario and saved changes. */
export function generateStaticParams() {
  return [];
}

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<AttendanceForm sessionId={id} />}>
      <SessionAttendanceRoute sessionId={id} />
    </Suspense>
  );
}
