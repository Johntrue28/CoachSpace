import Link from "next/link";
import { notFound } from "next/navigation";
import { groups, groupById, participantsOf } from "@/data/groups";
import { upcomingSessions } from "@/data/calendar";
import Avatar from "@/components/Avatar";
import ParticipantList from "@/components/ParticipantList";
import GroupAssignments from "@/components/library/GroupAssignments";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import { ArrowLeftIcon, ClockIcon, PinIcon, PlusIcon } from "@/components/Icons";

export function generateStaticParams() {
  return groups.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${groupById(id)?.name ?? "Group"} · CoachSpace` };
}

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = groupById(id);
  if (!group) notFound();

  const members = participantsOf(group.id);
  const sessions = upcomingSessions.filter((s) => s.groupId === group.id);

  return (
    <main className="px-4 pt-6">
      <Link href="/groups" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
        <ArrowLeftIcon className="h-4 w-4" /> Groups
      </Link>

      <header className="mt-4 flex items-center gap-4">
        <Avatar name={group.name} size="lg" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm text-ink-soft">
            {group.discipline} · {members.length} participants
          </p>
        </div>
      </header>

      <p className="mt-4 text-sm">{group.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        <span className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" /> {group.schedule}
        </span>
        <span className="flex items-center gap-1">
          <PinIcon className="h-4 w-4" /> {group.venue}
        </span>
      </div>

      <Card title="Upcoming sessions">
        {sessions.length === 0 ? (
          <Empty>No sessions scheduled this week.</Empty>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="flex gap-3">
                <div className="w-20 shrink-0 text-sm">
                  <p className="font-semibold">{s.day}</p>
                  <p className="text-ink-soft">{s.time}</p>
                </div>
                <div className="min-w-0 border-l-2 border-brand pl-3">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-ink-soft">{s.place}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="Announcements"
        action={
          <span className="flex gap-3">
            <Link href={`/announcements/new?group=${group.id}`} className="flex items-center gap-1 text-sm font-semibold text-brand">
              <PlusIcon className="h-4 w-4" /> New
            </Link>
            <Link href={`/announcements?group=${group.id}`} className="text-sm font-semibold text-brand">
              See all
            </Link>
          </span>
        }
      >
        <RecentAnnouncements groupId={group.id} />
      </Card>

      <Card title="Assigned exercises">
        <GroupAssignments groupId={group.id} />
      </Card>

      <Card title={`Participants (${members.length})`}>
        <ParticipantList participants={members} />
      </Card>
    </main>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-soft">{children}</p>;
}
