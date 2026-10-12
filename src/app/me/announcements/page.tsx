import { DEMO_PARTICIPANT_ID, groupIdsOf } from "@/data/groups";
import AnnouncementBoard from "@/components/announcements/AnnouncementBoard";

export const metadata = { title: "Announcements · CoachSpace" };

export default async function ParticipantAnnouncementsPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  return <AnnouncementBoard groupId={group} groupIds={groupIdsOf(DEMO_PARTICIPANT_ID)} basePath="/me/announcements" />;
}
