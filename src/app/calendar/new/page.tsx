import { Suspense } from "react";
import SessionForm from "@/components/calendar/SessionForm";
import NewSessionRoute from "@/components/calendar/NewSessionRoute";

export const metadata = { title: "New session · CoachSpace" };

/** Built in advance; `?date=` is read in the browser (D-054). */
export default function NewSessionPage() {
  return (
    <Suspense fallback={<SessionForm />}>
      <NewSessionRoute />
    </Suspense>
  );
}
