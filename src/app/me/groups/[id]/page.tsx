import Link from "next/link";
import { notFound } from "next/navigation";
import { coach, DEMO_PARTICIPANT_ID, groupById, groupIdsOf, memberCount, scheduleLabel } from "@/data/groups";
import Avatar from "@/components/Avatar";
import { ChatIcon, ClockIcon, PinIcon } from "@/components/Icons";
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
    <main className="px-4 pt-6">
      <BackLink fallback="/me" fallbackLabel="Home" />
      <header className="mt-4 flex items-center gap-4">
        <Avatar name={group.name} size="lg" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm text-ink-soft">
            {group.discipline} · {memberCount(group.id)} participants · Coach {coach.name}
          </p>
        </div>
      </header>
      <p className="mt-4 text-sm">{group.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        <span className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" /> {scheduleLabel(group)}
        </span>
        <span className="flex items-center gap-1">
          <PinIcon className="h-4 w-4" /> {group.venue}
        </span>
      </div>
      <Link
        href={`/me/chat/c-${group.id}`}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-semibold text-brand ring-1 ring-line"
      >
        <ChatIcon className="h-5 w-5" /> Open group chat
      </Link>

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
