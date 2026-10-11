"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { announcementsFor } from "@/data/messages";
import AnnouncementCard from "./AnnouncementCard";

/**
 * Latest announcements for the dashboard, one group's page, or a participant's groups.
 * `canPost` shows the coach's "Post one" link in the empty state.
 */
export default function RecentAnnouncements({
  groupId,
  groupIds,
  limit = 3,
  canPost = true,
}: {
  groupId?: string;
  groupIds?: string[];
  limit?: number;
  canPost?: boolean;
}) {
  const { announcements } = useDemoStore();
  const shown = announcementsFor(announcements, groupIds ?? groupId).slice(0, limit);
  const newHref = groupId ? `/announcements/new?group=${groupId}` : "/announcements/new";

  if (shown.length === 0) {
    if (!canPost) return <p className="text-sm text-ink-soft">No announcements yet.</p>;
    return (
      <p className="text-sm text-ink-soft">
        No announcements yet.{" "}
        <Link href={newHref} className="font-semibold text-brand-strong">
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
