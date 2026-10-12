import { notFound } from "next/navigation";
import { DEMO_PARTICIPANT_ID, groupById, groupIdsOf } from "@/data/groups";
import { ChatIcon } from "@/components/Icons";
import GroupHeader from "@/components/groups/GroupHeader";
import { ButtonLink } from "@/components/ui/Button";
import SessionList from "@/components/calendar/SessionList";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import MyGroupExercises from "@/components/participant/MyGroupExercises";
import Card from "@/components/SectionCard";
import BackLink from "@/components/navigation/BackLink";

export function generateStaticParams() {
  return groupIdsOf(DEMO_PARTICIPANT_ID).map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function ParticipantGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = groupById(id);
  // A participant only sees the groups they belong to.
  if (!group || !groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id)) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/me" fallbackLabel="Home" />
      <div className="mt-4">
        <GroupHeader
          group={group}
          actions={
            <ButtonLink href={`/me/chat/c-${group.id}`} variant="secondary" size="sm">
              <ChatIcon className="h-4 w-4 text-ink-soft" /> Open group chat
            </ButtonLink>
          }
        />
      </div>

      <Card title="Upcoming sessions">
        <SessionList groupId={group.id} limit={3} sessionPath="/me/calendar" />
      </Card>
      <Card title="Announcements">
        <RecentAnnouncements groupId={group.id} canPost={false} />
      </Card>
      <Card title="My exercises" href="/me/videos" linkLabel="My Videos">
        <MyGroupExercises groupId={group.id} />
      </Card>
    </main>
  );
}
