"use client";

import Link from "next/link";
import { groups, groupById, participantsOf, sessionWords } from "@/data/groups";
import SessionList from "@/components/calendar/SessionList";
import { groupConversationId } from "@/data/messages";
import ParticipantList from "@/components/ParticipantList";
import SectionCard from "@/components/SectionCard";
import GroupAssignments from "@/components/library/GroupAssignments";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import GroupCard from "@/components/groups/GroupCard";
import GroupHeader from "@/components/groups/GroupHeader";
import { CalendarIcon, ChatIcon, PlusIcon } from "@/components/Icons";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { ButtonLink } from "@/components/ui/Button";
import AttendanceOnly from "@/components/attendance/AttendanceOnly";

const linkClass = "flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline";

/**
 * A group's page (Figma Groups, D-046): the group's details and actions, participants, upcoming
 * sessions, announcements and assigned exercises. From 1280 px the other groups are listed on the left.
 * A client component so it always shows the active demo scenario (D-053).
 */
export default function GroupPage({ id }: { id: string }) {
  const flash = useFlashMessage();
  const group = groupById(id);
  if (!group) {
    return (
      <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
        <BackLink fallback="/groups" fallbackLabel="Groups" />
        <p className="mt-6 text-sm text-ink-soft">This group was not found in this demo.</p>
      </main>
    );
  }

  const members = participantsOf(group.id);
  const chatId = groupConversationId(group.id);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <BackLink fallback="/groups" fallbackLabel="Groups" />
      <LiveStatus message={flash} className="mt-4" />

      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <nav aria-label="All groups" className="hidden xl:block">
          <ul className="sticky top-[calc(var(--shell-header-h)+1.5rem)] space-y-3">
            {groups.map((g) => (
              <li key={g.id}>
                <GroupCard group={g} variant="rail" current={g.id === group.id} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          <GroupHeader
            group={group}
            actions={
              <>
                <AttendanceOnly>
                  <ButtonLink href={`/attendance?group=${group.id}`} size="sm">
                    Take attendance
                  </ButtonLink>
                </AttendanceOnly>
                <ButtonLink href={chatId ? `/chat/${chatId}` : "/chat"} variant="secondary" size="sm">
                  <ChatIcon className="h-4 w-4 text-ink-soft" />
                  Group chat
                </ButtonLink>
                <ButtonLink href={`/calendar?group=${group.id}`} variant="secondary" size="sm">
                  <CalendarIcon className="h-4 w-4 text-ink-soft" />
                  View sessions
                </ButtonLink>
              </>
            }
          />

          <SectionCard
            title="Participants"
            className=""
            action={<span className="shrink-0 text-xs font-medium text-ink-soft">{members.length} total</span>}
          >
            <ParticipantList participants={members} />
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <SectionCard title={`Upcoming ${sessionWords().many}`} href={`/calendar?group=${group.id}`} linkLabel="Calendar" className="">
              <SessionList groupId={group.id} limit={3} />
            </SectionCard>

            <SectionCard
              title="Announcements"
              className=""
              action={
                <span className="flex shrink-0 gap-3">
                  <Link href={`/announcements/new?group=${group.id}`} className={linkClass}>
                    <PlusIcon className="h-4 w-4" /> New
                  </Link>
                  <Link href={`/announcements?group=${group.id}`} className={linkClass}>
                    See all
                  </Link>
                </span>
              }
            >
              <RecentAnnouncements groupId={group.id} />
            </SectionCard>
          </div>

          <SectionCard
            title="Videos & Exercises"
            className=""
            action={
              <span className="flex shrink-0 gap-3">
                <Link href={`/groups/${group.id}/assign`} className={linkClass}>
                  <PlusIcon className="h-4 w-4" /> Assign exercises
                </Link>
                <Link href="/library" className={linkClass}>
                  Library
                </Link>
              </span>
            }
          >
            <GroupAssignments groupId={group.id} />
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
