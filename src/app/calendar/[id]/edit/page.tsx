import { notFound } from "next/navigation";
import { isOneOffId, regularSession } from "@/data/calendar";
import SessionForm from "@/components/calendar/SessionForm";

export const metadata = { title: "Change session · CoachSpace" };

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isOneOffId(id) && !regularSession(id)) notFound();
  return <SessionForm sessionId={id} />;
}
