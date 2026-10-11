import { notFound } from "next/navigation";
import { isOneOffId, regularSession } from "@/data/calendar";
import { DEMO_PARTICIPANT_ID, groupIdsOf } from "@/data/groups";
import ParticipantSessionDetail from "@/components/participant/ParticipantSessionDetail";

export const metadata = { title: "Session · CoachSpace" };

export default async function ParticipantSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Recurring sessions are checked here (they must belong to one of the participant's groups);
  // one-off sessions only exist in the browser and are checked there.
  if (!isOneOffId(id)) {
    const regular = regularSession(id);
    if (!regular || !groupIdsOf(DEMO_PARTICIPANT_ID).includes(regular.groupId)) notFound();
  }
  return <ParticipantSessionDetail id={id} />;
}
