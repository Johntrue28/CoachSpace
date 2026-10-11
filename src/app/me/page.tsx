import Link from "next/link";
import { DEMO_PARTICIPANT_ID, groupById, groupIdsOf, participantById, scheduleLabel } from "@/data/groups";
import { groupConversationId } from "@/data/messages";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon } from "@/components/Icons";
import SectionCard from "@/components/SectionCard";
import NextSessionCard from "@/components/calendar/NextSessionCard";
import NextSessionLabel from "@/components/calendar/NextSessionLabel";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import ChatNotification from "@/components/chat/ChatNotification";
import UnreadBadge from "@/components/chat/UnreadBadge";
import UnreadSummary from "@/components/chat/UnreadSummary";

export const metadata = { title: "My space · CoachSpace" };

export default function ParticipantHome() {
  const me = participantById(DEMO_PARTICIPANT_ID)!;
  const myGroupIds = groupIdsOf(me.id);
  const myGroups = myGroupIds.map((id) => groupById(id)!);

  return (
    <main>
      <header className="bg-brand px-4 pb-16 pt-8 text-on-brand">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-on-brand/75">Participant view</p>
            <h1 className="mt-1 text-2xl font-bold">Hi, {me.name.split(" ")[0]}</h1>
          </div>
          <ChatNotification viewerId={me.id} href="/me/chat" className="bg-on-brand/15 text-on-brand hover:bg-on-brand/25" />
        </div>
      </header>

      <section className="-mt-12 px-4">
        <NextSessionCard groupIds={myGroupIds} sessionPath="/me/calendar" groupPath="/me/groups" />
      </section>

      <UnreadSummary viewerId={me.id} basePath="/me/chat" />

      <div className="px-4">
        <SectionCard title="Calendar" href="/me/calendar" linkLabel="Open calendar">
          <MonthCalendar groupIds={myGroupIds} sessionPath="/me/calendar" />
        </SectionCard>

        <SectionCard title="My groups">
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
                  <UnreadBadge conversationId={groupConversationId(g.id)} viewerId={me.id} label="unread in the group chat" />
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Announcements">
          <RecentAnnouncements groupIds={myGroupIds} limit={3} canPost={false} />
        </SectionCard>

        <SectionCard title="My Videos" href="/me/videos" linkLabel="Open">
          <p className="text-sm text-ink-soft">Exercises and videos your coach assigned to you, in one place.</p>
        </SectionCard>
      </div>

      <p className="px-4 pt-6 text-center text-xs text-ink-soft">Demo with fictional data</p>
    </main>
  );
}
