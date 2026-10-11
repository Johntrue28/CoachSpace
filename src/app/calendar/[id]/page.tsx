import { notFound } from "next/navigation";
import { isOneOffId, regularSession } from "@/data/calendar";
import SessionDetail from "@/components/calendar/SessionDetail";

export const metadata = { title: "Session · CoachSpace" };

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  // Recurring sessions can be checked here; one-off sessions only exist in the browser.
  if (!isOneOffId(id) && !regularSession(id)) notFound();
  return <SessionDetail id={id} saved={saved} />;
}
