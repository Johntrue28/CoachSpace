import { Suspense } from "react";
import CalendarRoute, { CalendarScreen } from "@/components/calendar/CalendarRoute";

export const metadata = { title: "Calendar · CoachSpace" };

/** Built in advance; the date, view and group filter in the URL are read in the browser (D-054). */
export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarScreen />}>
      <CalendarRoute />
    </Suspense>
  );
}
