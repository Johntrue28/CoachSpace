"use client";

import { groups, peopleSummary, severalGroupsText } from "@/data/groups";
import GroupCard from "@/components/groups/GroupCard";
import PageHeader from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PlusIcon } from "@/components/Icons";

/** Groups page (Figma Groups, D-046): one card per group of the active scenario, each opening the group's page. */
export default function GroupsOverview() {
  const { people, inSeveral } = peopleSummary();
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title="Groups"
        description="Your groups, their participants and training schedule."
        action={
          <ButtonLink href="/groups/new">
            <PlusIcon className="h-4 w-4" />
            New group
          </ButtonLink>
        }
      />
      <p className="mt-4 text-sm font-medium text-ink-soft">
        {groups.length} groups · {people} participants
        {/* Group sizes add up to more than the people when someone is in two groups (audit F-06). */}
        {inSeveral > 0 && <span className="font-normal"> · {severalGroupsText(inSeveral)}, so group sizes add up to more</span>}
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
