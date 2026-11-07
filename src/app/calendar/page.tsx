import { Suspense } from "react";
import CalendarRoute from "@/components/calendar/CalendarRoute";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata = { title: "Calendar · CoachSpace" };

/** Built in advance; the date and the group filter in the URL are read in the browser (D-054). */
export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarView />}>
      <CalendarRoute />
    </Suspense>
  );
}
