import AttendanceStart from "@/components/attendance/AttendanceStart";

export const metadata = { title: "Take attendance · CoachSpace" };

export default async function AttendanceStartPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  return <AttendanceStart groupId={group} />;
}
