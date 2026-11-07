"use client";

import { useDemoStore } from "@/data/store";
import { announcementsFor } from "@/data/messages";
import { groups as allGroups } from "@/data/groups";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { MegaphoneIcon, PlusIcon } from "@/components/Icons";
import AnnouncementCard from "./AnnouncementCard";
import { AnnouncementComposer } from "./NewAnnouncementForm";
import { useFlashMessage, useNavigation } from "@/components/navigation/NavigationProvider";
import { ButtonLink } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import MessagesTabs from "@/components/messages/MessagesTabs";
import StatusMessage from "@/components/ui/StatusMessage";

/**
 * Announcements board (Figma Announcements, D-050). The coach sees every group, a group filter,
 * "New announcement" and, from 1280 px, the form beside the list. A participant (`groupIds`) sees
 * only the announcements for their groups, read-only.
 */
export default function AnnouncementBoard({
  groupId,
  groupIds,
  basePath = "/announcements",
}: {
  groupId?: string;
  /** Participant view: only these groups, no posting. */
  groupIds?: string[];
  basePath?: string;
}) {
  const nav = useNavigation();
  const posted = useFlashMessage();
  const { announcements, ready } = useDemoStore();
  const canPost = !groupIds;
  const groups = groupIds ? allGroups.filter((g) => groupIds.includes(g.id)) : allGroups;
  const filter = groupId && groups.some((g) => g.id === groupId) ? groupId : undefined;
  const shown = announcementsFor(announcements, filter ?? groupIds);
  const newHref = filter ? `/announcements/new?group=${filter}` : "/announcements/new";

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <PageHeader
        title="Messages"
        description={canPost ? "Share clear updates with your groups, kept apart from the chat." : "Updates from your coach for your groups."}
        action={
          canPost && (
            <ButtonLink href={newHref}>
              <PlusIcon className="h-4 w-4" /> New announcement
            </ButtonLink>
          )
        }
      />
      <MessagesTabs active="announcements" participant={!canPost} className="mt-4" />

      {posted && <StatusMessage className="mt-4 font-medium">{posted}</StatusMessage>}

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by group">
        {[{ id: undefined, name: "All" }, ...groups].map((g) => {
          const active = filter === g.id;
          return (
            <button
              key={g.id ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => nav.replace(g.id ? `${basePath}?group=${g.id}` : basePath)}
              className={`min-h-9 rounded-control px-3 text-sm font-semibold ring-1 ${
                active ? "bg-brand-strong text-on-brand ring-brand-strong" : "bg-card text-ink ring-line hover:ring-brand/40"
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
      {filter && <p className="mt-2 text-xs text-ink-soft">Includes announcements for all groups.</p>}

      <div className={`mt-5 grid gap-6 ${canPost ? "xl:grid-cols-[minmax(0,1fr)_22rem]" : ""}`}>
        <div className="min-w-0">
          {!ready ? null : shown.length === 0 ? (
            <EmptyState
              icon={<MegaphoneIcon className="h-5 w-5" />}
              title="No announcements here yet"
              action={
                canPost && (
                  <ButtonLink href={newHref} variant="secondary" size="sm">
                    Post the first one
                  </ButtonLink>
                )
              }
            />
          ) : (
            <ul className="space-y-3">
              {shown.map((a) => (
                <li key={a.id} id={`an-${a.id}`} className={cardClass({ className: "scroll-mt-24 sm:p-5" })}>
                  <AnnouncementCard announcement={a} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {canPost && (
          <section aria-labelledby="compose-heading" className={cardClass({ className: "hidden h-fit sm:p-5 xl:sticky xl:top-[calc(var(--shell-header-h)+1.5rem)] xl:block" })}>
            <h2 id="compose-heading" className="text-base font-bold text-ink">
              Create announcement
            </h2>
            <AnnouncementComposer key={filter ?? "all"} groupId={filter} compact />
          </section>
        )}
      </div>

      <div className="mt-8">
        <DeviceOnlyNotice />
      </div>
    </main>
  );
}
