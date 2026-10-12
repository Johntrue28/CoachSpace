"use client";

import { useSearchParams } from "next/navigation";
import AnnouncementBoard from "./AnnouncementBoard";
import NewAnnouncementForm from "./NewAnnouncementForm";
import { DEMO_PARTICIPANT_ID, groupIdsOf } from "@/data/groups";

/** The announcements board of the coach or of the participant, for one group filter (D-054). */
export function AnnouncementsScreen({ participant = false, groupId }: { participant?: boolean; groupId?: string }) {
  if (participant) return <AnnouncementBoard groupId={groupId} groupIds={groupIdsOf(DEMO_PARTICIPANT_ID)} basePath="/me/announcements" />;
  return <AnnouncementBoard groupId={groupId} />;
}

/** Reads `?group=` in the browser so the page can be built in advance. */
export default function AnnouncementsRoute({ participant = false }: { participant?: boolean }) {
  return <AnnouncementsScreen participant={participant} groupId={useSearchParams().get("group") ?? undefined} />;
}

/** The New announcement page, with the audience from `?group=`. */
export function NewAnnouncementRoute() {
  return <NewAnnouncementForm groupId={useSearchParams().get("group") ?? undefined} />;
}
