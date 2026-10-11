import { notFound } from "next/navigation";
import { isOneOffId, regularSession } from "@/data/calendar";
import SessionDetail from "@/components/calendar/SessionDetail";

export const metadata = { title: "Session · CoachSpace" };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Recurring sessions can be checked here; one-off sessions only exist in the browser.
  if (!isOneOffId(id) && !regularSession(id)) notFound();
  return <SessionDetail id={id} />;
}
