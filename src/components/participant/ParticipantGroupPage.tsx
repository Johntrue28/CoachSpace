"use client";

import { DEMO_PARTICIPANT_ID, groupById, groupIdsOf, sessionWords } from "@/data/groups";
import { ChatIcon } from "@/components/Icons";
import GroupHeader from "@/components/groups/GroupHeader";
import { ButtonLink } from "@/components/ui/Button";
import SessionList from "@/components/calendar/SessionList";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import MyGroupExercises from "@/components/participant/MyGroupExercises";
import Card from "@/components/SectionCard";
import BackLink from "@/components/navigation/BackLink";

/** A group as the participant sees it. A client component so it shows the active demo scenario (D-053). */
export default function ParticipantGroupPage({ id }: { id: string }) {
  const group = groupById(id);
  // A participant only sees the groups they belong to.
  if (!group || !groupIdsOf(DEMO_PARTICIPANT_ID).includes(group.id)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <BackLink fallback="/me" fallbackLabel="Home" />
        <p className="mt-6 text-sm text-ink-soft">This group is not available.</p>
      </main>
    );
  }

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

      <Card title={`Upcoming ${sessionWords().many}`}>
        <SessionList groupId={group.id} limit={3} sessionPath="/me/calendar" />
      </Card>
      <Card title="Announcements">
        <RecentAnnouncements groupId={group.id} canPost={false} />
      </Card>
      <Card title="My exercises" href="/me/videos" linkLabel="All exercises">
        <MyGroupExercises groupId={group.id} />
      </Card>
    </main>
  );
}
