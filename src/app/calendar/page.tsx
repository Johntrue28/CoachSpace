import CalendarView from "@/components/calendar/CalendarView";

export const metadata = { title: "Calendar · CoachSpace" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; week?: string; view?: string; group?: string }>;
}) {
  const { date, week, view, group } = await searchParams;
  // ?week= alone (older links) opens the week view.
  const mode = view === "week" || (week && view !== "month") ? "week" : "month";
  return <CalendarView date={date} week={week} view={mode} groupFilter={group} canManage />;
}
