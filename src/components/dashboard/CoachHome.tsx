"use client";

import Link from "next/link";
import { coach } from "@/data/groups";
import { CalendarIcon } from "@/components/Icons";
import { ButtonLink } from "@/components/ui/Button";
import SectionCard from "@/components/SectionCard";
import NextSessionCard from "@/components/calendar/NextSessionCard";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import AttendanceOnly from "@/components/attendance/AttendanceOnly";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import UnreadSummary from "@/components/chat/UnreadSummary";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCards from "@/components/dashboard/StatCards";
import QuickActions from "@/components/dashboard/QuickActions";
import UpcomingSessions from "@/components/calendar/UpcomingSessions";
import AttendanceOverview from "@/components/dashboard/AttendanceOverview";
import GroupsList from "@/components/dashboard/GroupsList";
import DemoIntro from "@/components/dashboard/DemoIntro";

/**
 * Coach dashboard (D-044), following the Figma Dashboard: header, three figures, then two columns
 * from 1280 px (next and upcoming sessions, new messages and groups; quick actions, calendar,
 * attendance and announcements). On smaller screens the sections stack, quick actions first.
 * A client component so it always shows the active demo scenario (D-053).
 */
export default function CoachHome() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <DashboardHeader
        firstName={coach.name.split(" ")[0]}
        subtitle="Here’s what’s happening across your groups today."
        action={
          <ButtonLink href="/calendar" variant="secondary">
            <CalendarIcon className="h-4 w-4 text-ink-soft" />
            View calendar
          </ButtonLink>
        }
      />

      <div className="mt-6">
        <DemoIntro />
      </div>

      <StatCards className="mt-6" />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <section aria-label="Next session">
            <NextSessionCard coachActions />
          </section>
          <QuickActions className="xl:hidden" />
          <UpcomingSessions skipNext seeAll={{ href: "/calendar", label: "See full schedule" }} />
          <UnreadSummary />
          <SectionCard title="My groups" href="/groups" className="">
            <GroupsList />
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-6">
          <QuickActions className="hidden xl:block" />
          <SectionCard title="Calendar" href="/calendar" linkLabel="Open calendar" className="">
            <MonthCalendar createPath="/calendar/new" />
          </SectionCard>
          <AttendanceOnly>
            <SectionCard
              title="Attendance"
              className=""
              action={
                <Link href="/attendance" className="shrink-0 text-sm font-semibold text-brand-strong hover:underline">
                  Take attendance
                </Link>
              }
            >
              <AttendanceOverview />
            </SectionCard>
          </AttendanceOnly>
          <SectionCard title="Recent announcements" href="/announcements" className="">
            <RecentAnnouncements limit={2} />
          </SectionCard>
        </div>
      </div>

      <p className="pt-8 text-center text-xs text-ink-soft">Demo with fictional data</p>
    </main>
  );
}
