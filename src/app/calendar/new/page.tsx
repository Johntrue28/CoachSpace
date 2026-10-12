import { Suspense } from "react";
import NewSessionRoute, { NewSessionFallback } from "@/components/calendar/NewSessionRoute";

export const metadata = { title: "New session · CoachSpace" };

/** Built in advance; `?date=` is read in the browser (D-054). */
export default function NewSessionPage() {
  return (
    <Suspense fallback={<NewSessionFallback />}>
      <NewSessionRoute />
    </Suspense>
  );
}
