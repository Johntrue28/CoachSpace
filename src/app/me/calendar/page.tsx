import { DEMO_PARTICIPANT_ID, groupIdsOf } from "@/data/groups";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata = { title: "My calendar · CoachSpace" };

export default async function ParticipantCalendarPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  return (
    <CalendarView
      week={week}
      groupIds={groupIdsOf(DEMO_PARTICIPANT_ID)}
      basePath="/me/calendar"
      subtitle="Sessions for your groups."
    />
  );
}
