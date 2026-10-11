import { notFound } from "next/navigation";
import { isOneOffId, regularSession } from "@/data/calendar";
import AttendanceForm from "@/components/attendance/AttendanceForm";

export const metadata = { title: "Attendance · CoachSpace" };

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { id } = await params;
  const { group } = await searchParams;
  if (!isOneOffId(id) && !regularSession(id)) notFound();
  return <AttendanceForm sessionId={id} groupId={group} />;
}
