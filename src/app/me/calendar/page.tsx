import { DEMO_PARTICIPANT_ID, groupIdsOf } from "@/data/groups";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata = { title: "My calendar · CoachSpace" };

export default async function ParticipantCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; week?: string; view?: string }>;
}) {
  const { date, week, view } = await searchParams;
  const mode = view === "week" || (week && view !== "month") ? "week" : "month";
  return (
    <CalendarView
      date={date}
      week={week}
      view={mode}
      groupIds={groupIdsOf(DEMO_PARTICIPANT_ID)}
      basePath="/me/calendar"
      subtitle="Sessions for your groups."
    />
  );
}
