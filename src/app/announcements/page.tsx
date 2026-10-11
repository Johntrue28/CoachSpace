import AnnouncementBoard from "@/components/announcements/AnnouncementBoard";

export const metadata = { title: "Announcements · CoachSpace" };

export default async function AnnouncementsPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  return <AnnouncementBoard groupId={group} />;
}
