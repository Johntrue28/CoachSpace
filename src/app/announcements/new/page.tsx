import NewAnnouncementForm from "@/components/announcements/NewAnnouncementForm";

export const metadata = { title: "New announcement · CoachSpace" };

export default async function NewAnnouncementPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  return <NewAnnouncementForm groupId={group} />;
}
