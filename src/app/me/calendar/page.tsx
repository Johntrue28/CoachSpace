import { Suspense } from "react";
import CalendarRoute, { CalendarScreen } from "@/components/calendar/CalendarRoute";

export const metadata = { title: "My calendar · CoachSpace" };

/** Built in advance; the date and view in the URL are read in the browser (D-054). */
export default function ParticipantCalendarPage() {
  return (
    <Suspense fallback={<CalendarScreen participant />}>
      <CalendarRoute participant />
    </Suspense>
  );
}
