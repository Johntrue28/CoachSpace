"use client";

import { groups, uniqueParticipantCount } from "@/data/groups";
import GroupCard from "@/components/groups/GroupCard";
import PageHeader from "@/components/ui/PageHeader";

/** Groups page (Figma Groups, D-046): one card per group of the active scenario, each opening the group's page. */
export default function GroupsOverview() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader title="Groups" description="Your groups, their participants and training schedule." />
      <p className="mt-4 text-sm font-medium text-ink-soft">
        {groups.length} groups · {uniqueParticipantCount()} participants
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {groups.map((g) => (
          <li key={g.id}>
            <GroupCard group={g} />
          </li>
        ))}
      </ul>
    </main>
  );
}
