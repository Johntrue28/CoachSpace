"use client";

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
import UnreadBadge from "@/components/chat/UnreadBadge";
import UnreadSummary from "@/components/chat/UnreadSummary";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpcomingSessions from "@/components/calendar/UpcomingSessions";
import MyVideosPreview from "@/components/participant/MyVideosPreview";

/**
 * Participant home (Figma participant Home, D-052): greeting, next and upcoming sessions, new
 * messages and groups; My Videos, announcements and the month calendar. Jordan's groups only.
 * A client component so it always shows the active demo scenario (D-053).
 */
export default function ParticipantHome() {
  const me = participantById(DEMO_PARTICIPANT_ID)!;
  const myGroupIds = groupIdsOf(me.id);
  const myGroups = myGroupIds.map((id) => groupById(id)!);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <DashboardHeader firstName={me.name.split(" ")[0]} subtitle="Your sessions, messages and group updates." />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <section aria-label="Next session">
            <NextSessionCard groupIds={myGroupIds} sessionPath="/me/calendar" groupPath="/me/groups" />
          </section>
          <UpcomingSessions
            limit={2}
            skipNext
            groupIds={myGroupIds}
            basePath="/me/calendar"
            seeAll={{ href: "/me/calendar", label: "My calendar" }}
          />
          <UnreadSummary viewerId={me.id} basePath="/me/chat" />
          <SectionCard title="My groups" className="">
            <ul className="divide-y divide-line">
              {myGroups.map((g) => (
                <li key={g.id}>
                  <Link href={`/me/groups/${g.id}`} className="-mx-2 flex items-center gap-3 rounded-control px-2 py-3 hover:bg-surface">
                    <Avatar name={g.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{g.name}</p>
                      <p className="text-sm text-ink-soft">
                        <NextSessionLabel groupId={g.id} fallback={scheduleLabel(g)} />
                      </p>
                    </div>
                    <UnreadBadge conversationId={groupConversationId(g.id)} viewerId={me.id} label="unread in the group chat" />
                    <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-6">
          <SectionCard title="My Videos" href="/me/videos" linkLabel="See all" className="">
            <MyVideosPreview />
          </SectionCard>
          <SectionCard title="Announcements" href="/me/announcements" className="">
            <RecentAnnouncements groupIds={myGroupIds} limit={3} canPost={false} />
          </SectionCard>
          <SectionCard title="Calendar" href="/me/calendar" linkLabel="Open calendar" className="">
            <MonthCalendar groupIds={myGroupIds} sessionPath="/me/calendar" />
          </SectionCard>
        </div>
      </div>

      <p className="pt-8 text-center text-xs text-ink-soft">Demo with fictional data</p>
    </main>
  );
}
