"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { announcementsFor } from "@/data/messages";
import AnnouncementCard from "./AnnouncementCard";

/** Latest announcements for the dashboard, or for one group's page. */
export default function RecentAnnouncements({ groupId, limit = 3 }: { groupId?: string; limit?: number }) {
  const { announcements } = useDemoStore();
  const shown = announcementsFor(announcements, groupId).slice(0, limit);
  const newHref = groupId ? `/announcements/new?group=${groupId}` : "/announcements/new";

  if (shown.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        No announcements yet.{" "}
        <Link href={newHref} className="font-semibold text-brand">
          Post one
        </Link>
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {shown.map((a) => (
        <li key={a.id}>
          <AnnouncementCard announcement={a} showAudience={!groupId || a.groupId === null} />
        </li>
      ))}
    </ul>
  );
}
