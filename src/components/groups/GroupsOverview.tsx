"use client";

import { groups, peopleSummary, severalGroupsText } from "@/data/groups";
import GroupCard from "@/components/groups/GroupCard";
import PageHeader from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PlusIcon } from "@/components/Icons";
import { listClass } from "@/components/ui/Card";
import { t } from "@/i18n";

/** Groups page (Figma Groups, D-046): one card per group of the active scenario, each opening the group's page. */
export default function GroupsOverview() {
  const { people, inSeveral } = peopleSummary();
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title={t("groups.title")}
        description={t("groups.description")}
        action={
          <ButtonLink href="/groups/new">
            <PlusIcon className="h-4 w-4" />
            {t("groups.newGroup")}
          </ButtonLink>
        }
      />
      <p className="mt-4 text-sm font-medium text-ink-soft">
        {t("groups.totals", { groups: groups.length, people })}
        {/* Group sizes add up to more than the people when someone is in two groups (audit F-06); explained from 640 px. */}
        {inSeveral > 0 && <span className="hidden font-normal sm:inline"> · {severalGroupsText(inSeveral)}{t("groups.addUp")}</span>}
      </p>
      <ul className={listClass("mt-3 max-w-3xl")} aria-label={t("groups.yourGroups")}>
        {groups.map((g) => (
          <li key={g.id}>
            <GroupCard group={g} />
          </li>
        ))}
      </ul>
    </main>
  );
}
