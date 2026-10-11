"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { announcementsFor } from "@/data/messages";
import { groupById, groups } from "@/data/groups";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import ResetDemoButton from "@/components/ResetDemoButton";
import { PlusIcon } from "@/components/Icons";
import AnnouncementCard from "./AnnouncementCard";
import { useFlashMessage, useNavigation } from "@/components/navigation/NavigationProvider";
import { buttonClass } from "@/components/ui/Button";
import StatusMessage from "@/components/ui/StatusMessage";

export default function AnnouncementBoard({ groupId }: { groupId?: string }) {
  const nav = useNavigation();
  const posted = useFlashMessage();
  const { announcements } = useDemoStore();
  const filter = groupId && groupById(groupId) ? groupId : undefined;
  const shown = announcementsFor(announcements, filter);
  const newHref = filter ? `/announcements/new?group=${filter}` : "/announcements/new";

  return (
    <main className="px-4 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="mt-1 text-sm text-ink-soft">Important updates for your groups, kept apart from the chat.</p>
        </div>
        <Link
          href={newHref}
          className={buttonClass({ size: "sm", className: "shrink-0" })}
        >
          <PlusIcon className="h-4 w-4" /> New
        </Link>
      </div>

      {posted && (
        <StatusMessage className="mt-4 font-medium">{posted}</StatusMessage>
      )}

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by group">
        {[{ id: undefined, name: "All" }, ...groups].map((g) => {
          const active = filter === g.id;
          return (
            <button
              key={g.id ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => nav.replace(g.id ? `/announcements?group=${g.id}` : "/announcements")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                active ? "bg-brand text-on-brand ring-brand" : "bg-card text-ink ring-line"
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
      {filter && <p className="mt-2 text-xs text-ink-soft">Includes announcements for all groups.</p>}

      {shown.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card p-6 text-center ring-1 ring-line">
          <p className="text-sm text-ink-soft">No announcements here yet.</p>
          <Link href={newHref} className="mt-2 inline-block text-sm font-semibold text-brand-strong">
            Post the first one
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map((a) => (
            <li key={a.id} className="rounded-2xl border-l-4 border-accent bg-card p-4 ring-1 ring-line">
              <AnnouncementCard announcement={a} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-y-3">
        <DeviceOnlyNotice />
        <ResetDemoButton />
      </div>
    </main>
  );
}
