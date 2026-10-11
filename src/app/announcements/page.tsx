import AnnouncementBoard from "@/components/announcements/AnnouncementBoard";

export const metadata = { title: "Announcements · CoachSpace" };

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; posted?: string }>;
}) {
  const { group, posted } = await searchParams;
  return <AnnouncementBoard groupId={group} posted={posted === "1"} />;
}
