import { notFound } from "next/navigation";
import { sessionById } from "@/data/calendar";
import AttendanceForm from "@/components/attendance/AttendanceForm";

export const metadata = { title: "Attendance · CoachSpace" };

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sessionById(id)) notFound();
  return <AttendanceForm sessionId={id} />;
}
