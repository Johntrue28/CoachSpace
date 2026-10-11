import CalendarView from "@/components/calendar/CalendarView";

export const metadata = { title: "Calendar · CoachSpace" };

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  return <CalendarView week={week} />;
}
