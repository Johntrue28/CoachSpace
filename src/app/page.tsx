import Link from "next/link";
import { coach, groups, memberCount } from "@/data/groups";
import { groupConversationId } from "@/data/messages";
import { ChevronRightIcon } from "@/components/Icons";
import Avatar from "@/components/Avatar";
import SectionCard from "@/components/SectionCard";
import NextSessionCard from "@/components/calendar/NextSessionCard";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import RecentAttendance from "@/components/attendance/RecentAttendance";
import AttendanceOnly from "@/components/attendance/AttendanceOnly";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import ChatNotification from "@/components/chat/ChatNotification";
import UnreadBadge from "@/components/chat/UnreadBadge";
import UnreadSummary from "@/components/chat/UnreadSummary";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl">
      <header className="bg-brand-strong px-4 pb-16 pt-8 text-on-brand">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-on-brand">{coach.organisation}</p>
            <h1 className="mt-1 text-2xl font-bold">Hi, {coach.name.split(" ")[0]}</h1>
          </div>
          <ChatNotification className="bg-on-brand/15 text-on-brand hover:bg-on-brand/25" />
        </div>
      </header>

      <section className="-mt-12 px-4">
        <NextSessionCard coachActions />
      </section>

      <UnreadSummary />

      <div className="px-4">
        <SectionCard title="Calendar" href="/calendar" linkLabel="Open calendar">
          <MonthCalendar createPath="/calendar/new" />
        </SectionCard>

        <SectionCard title="My groups" href="/groups">
          <ul className="divide-y divide-line">
            {groups.map((g) => (
              <li key={g.id}>
                <Link href={`/groups/${g.id}`} className="flex items-center gap-3 py-3">
                  <Avatar name={g.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{g.name}</p>
                    <p className="text-sm text-ink-soft">
                      {g.discipline} · {memberCount(g.id)} participants
                    </p>
                  </div>
                  <UnreadBadge conversationId={groupConversationId(g.id)} label="unread in the group chat" />
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <AttendanceOnly>
          <SectionCard
            title="Attendance"
            action={
              <Link href="/attendance" className="text-sm font-semibold text-brand-strong">
                Take attendance
              </Link>
            }
          >
            <RecentAttendance />
          </SectionCard>
        </AttendanceOnly>

        <SectionCard title="Recent announcements" href="/announcements">
          <RecentAnnouncements limit={2} />
        </SectionCard>
      </div>

      <p className="px-4 pt-6 text-center text-xs text-ink-soft">Demo with fictional data</p>
    </main>
  );
}
