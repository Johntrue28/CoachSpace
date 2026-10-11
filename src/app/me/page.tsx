import Link from "next/link";
import { DEMO_PARTICIPANT_ID, groupById, groupIdsOf, participantById, scheduleLabel } from "@/data/groups";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon } from "@/components/Icons";
import NextSessionCard from "@/components/calendar/NextSessionCard";
import NextSessionLabel from "@/components/calendar/NextSessionLabel";
import SessionList from "@/components/calendar/SessionList";
import WeekStrip from "@/components/calendar/WeekStrip";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import Card from "@/components/participant/Card";

export const metadata = { title: "My space · CoachSpace" };

export default function ParticipantHome() {
  const me = participantById(DEMO_PARTICIPANT_ID)!;
  const myGroupIds = groupIdsOf(me.id);
  const myGroups = myGroupIds.map((id) => groupById(id)!);

  return (
    <main>
      <header className="bg-brand px-4 pb-16 pt-8 text-white">
        <p className="text-sm text-white/75">Participant view</p>
        <h1 className="mt-1 text-2xl font-bold">Hi, {me.name.split(" ")[0]}</h1>
      </header>

      <section className="-mt-12 px-4">
        <NextSessionCard groupIds={myGroupIds} sessionPath="/me/calendar" />
      </section>

      <div className="px-4">
        <Card title="My groups">
          <ul className="divide-y divide-line">
            {myGroups.map((g) => (
              <li key={g.id}>
                <Link href={`/me/groups/${g.id}`} className="flex items-center gap-3 py-3">
                  <Avatar name={g.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{g.name}</p>
                    <p className="text-sm text-ink-soft">
                      <NextSessionLabel groupId={g.id} fallback={scheduleLabel(g)} />
                    </p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Upcoming sessions" href="/me/calendar" linkLabel="Calendar">
          <WeekStrip groupIds={myGroupIds} calendarPath="/me/calendar" />
          <div className="mt-3" />
          <SessionList groupIds={myGroupIds} sessionPath="/me/calendar" />
        </Card>

        <Card title="Announcements">
          <RecentAnnouncements groupIds={myGroupIds} limit={4} canPost={false} />
        </Card>

        <Card title="My Videos" href="/me/videos" linkLabel="Open">
          <p className="text-sm text-ink-soft">Exercises and videos your coach assigned to you, in one place.</p>
        </Card>
      </div>

      <p className="px-4 pt-6 text-center text-xs text-ink-soft">Demo with fictional data</p>
    </main>
  );
}
