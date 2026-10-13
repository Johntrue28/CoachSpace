import { Suspense } from "react";
import AnnouncementsRoute, { AnnouncementsScreen } from "@/components/announcements/AnnouncementsRoute";

export const metadata = { title: "Announcements · CoachSpace" };

/** Built in advance; `?group=` is read in the browser (D-054). */
export default function ParticipantAnnouncementsPage() {
  return (
    <Suspense fallback={<AnnouncementsScreen participant />}>
      <AnnouncementsRoute participant />
    </Suspense>
  );
}
