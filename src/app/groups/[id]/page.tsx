import Link from "next/link";
import { notFound } from "next/navigation";
import { groups, groupById, participantsOf, scheduleLabel } from "@/data/groups";
import SessionList from "@/components/calendar/SessionList";
import { groupConversationId } from "@/data/messages";
import Avatar from "@/components/Avatar";
import ParticipantList from "@/components/ParticipantList";
import GroupAssignments from "@/components/library/GroupAssignments";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import { ClockIcon, PinIcon, PlusIcon } from "@/components/Icons";
import BackLink from "@/components/navigation/BackLink";
import { buttonClass } from "@/components/ui/Button";
import AttendanceOnly from "@/components/attendance/AttendanceOnly";

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
  const chatId = groupConversationId(group.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/groups" fallbackLabel="Groups" />

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
          <ClockIcon className="h-4 w-4" /> {scheduleLabel(group)}
        </span>
        <span className="flex items-center gap-1">
          <PinIcon className="h-4 w-4" /> {group.venue}
        </span>
      </div>

      <div className="mt-4 grid auto-cols-fr grid-flow-col gap-2">
        <AttendanceOnly>
          <Link href={`/attendance?group=${group.id}`} className={buttonClass()}>
            Take attendance
          </Link>
        </AttendanceOnly>
        <Link
          href={chatId ? `/chat/${chatId}` : "/chat"}
          className={buttonClass({ variant: "secondary" })}
        >
          Group chat
        </Link>
      </div>

      <Card
        title="Upcoming sessions"
        action={
          <Link href={`/calendar?group=${group.id}`} className="text-sm font-semibold text-brand-strong">
            Calendar
          </Link>
        }
      >
        <SessionList groupId={group.id} limit={3} />
      </Card>

      <Card
        title="Announcements"
        action={
          <span className="flex gap-3">
            <Link href={`/announcements/new?group=${group.id}`} className="flex items-center gap-1 text-sm font-semibold text-brand-strong">
              <PlusIcon className="h-4 w-4" /> New
            </Link>
            <Link href={`/announcements?group=${group.id}`} className="text-sm font-semibold text-brand-strong">
              See all
            </Link>
          </span>
        }
      >
        <RecentAnnouncements groupId={group.id} />
      </Card>

      <Card
        title="Videos & Exercises"
        action={
          <Link href="/library" className="text-sm font-semibold text-brand-strong">
            Library
          </Link>
        }
      >
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
