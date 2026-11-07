"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDemoStore } from "@/data/store";
import { groups, groupById, participantsOf } from "@/data/groups";
import SessionList from "@/components/calendar/SessionList";
import { groupConversationId } from "@/data/messages";
import SectionCard from "@/components/SectionCard";
import GroupAssignments from "@/components/library/GroupAssignments";
import GroupAttendance from "@/components/groups/GroupAttendance";
import GroupCard from "@/components/groups/GroupCard";
import GroupHero from "@/components/groups/GroupHero";
import PlayersPanel from "@/components/groups/PlayersPanel";
import { PlusIcon } from "@/components/Icons";
import { Loading } from "@/components/ui/EmptyState";
import AddMemberSheet from "@/components/groups/AddMemberSheet";
import InviteSheet from "@/components/groups/InviteSheet";
import BackLink from "@/components/navigation/BackLink";
import { useFlashMessage } from "@/components/navigation/NavigationProvider";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { t } from "@/i18n";

const TABS = ["Players", "Sessions", "Attendance", "Exercises"] as const;
const TAB_LABEL = { Players: "groups.tabPlayers", Sessions: "groups.tabSessions", Attendance: "groups.tabAttendance", Exercises: "groups.tabExercises" } as const;

const linkClass = "flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline";

/**
 * A group's page (Figma Groups, D-046; D-074, D-076): a header in the group's colour with Invite, then tabs —
 * Players (who is coming next, attendance %), Sessions, Attendance (the overview) and Exercises.
 * From 1280 px the other groups are listed on the left.
 * A client component so it always shows the active demo scenario (D-053).
 */
export default function GroupPage({ id }: { id: string }) {
  const flash = useFlashMessage();
  const { ready } = useDemoStore();
  const [sheet, setSheet] = useState<"member" | "invite" | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Players");
  // "Invite to a group" from the create menu opens the invite sheet at once (?invite=1, D-074).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("invite") === "1") setSheet("invite");
  }, []);
  const group = groupById(id);
  if (!group) {
    return (
      <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
        <BackLink fallback="/groups" fallbackLabel={t("back.groups")} />
        {/* A group created in this browser is known once the saved changes have been read (D-072). */}
        {ready ? <p className="mt-6 text-sm text-ink-soft">{t("groups.notFound")}</p> : <Loading className="mt-6" />}
      </main>
    );
  }

  const members = participantsOf(group.id);
  const chatId = groupConversationId(group.id);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <BackLink fallback="/groups" fallbackLabel={t("back.groups")} />
      <LiveStatus message={flash} className="mt-4" />

      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <nav aria-label={t("groups.allGroups")} className="hidden xl:block">
          <ul className="sticky top-[calc(var(--shell-header-h)+1.5rem)] space-y-3">
            {groups.map((g) => (
              <li key={g.id}>
                <GroupCard group={g} variant="rail" current={g.id === group.id} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <GroupHero group={group} chatId={chatId} onInvite={() => setSheet("invite")} />

          <div role="tablist" aria-label={t("groups.sections")} className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {TABS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setTab(id)}
                className={`press min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${
                  tab === id ? "bg-ink text-card" : "bg-card text-ink ring-1 ring-inset ring-line hover:bg-surface"
                }`}
              >
                {id === "Players" ? t("groups.tabPlayers", { count: members.length }) : t(TAB_LABEL[id])}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="fade-in mt-4" key={tab}>
            {tab === "Players" && <PlayersPanel group={group} onAdd={() => setSheet("member")} />}
            {tab === "Sessions" && (
              <SectionCard title={t("groups.upcomingSessions")} href={`/calendar?group=${group.id}`} linkLabel={t("groups.calendarLink")} className="">
                <SessionList groupId={group.id} limit={6} />
              </SectionCard>
            )}
            {tab === "Attendance" && <GroupAttendance group={group} />}
            {tab === "Exercises" && (
              <SectionCard
                title={t("groups.exercises")}
                className=""
                action={
                  <Link href={`/library?group=${group.id}`} className={linkClass}>
                    <PlusIcon className="h-4 w-4" /> {t("groups.assign")}
                  </Link>
                }
              >
                <GroupAssignments groupId={group.id} />
              </SectionCard>
            )}
          </div>
          <AddMemberSheet group={group} open={sheet === "member"} onClose={() => setSheet(null)} />
          <InviteSheet group={group} open={sheet === "invite"} onClose={() => setSheet(null)} />
        </div>
      </div>
    </main>
  );
}
