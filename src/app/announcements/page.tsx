import { Suspense } from "react";
import AnnouncementsRoute, { AnnouncementsScreen } from "@/components/announcements/AnnouncementsRoute";

export const metadata = { title: "Announcements · CoachSpace" };

/** Built in advance; `?group=` is read in the browser (D-054). */
export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<AnnouncementsScreen />}>
      <AnnouncementsRoute />
    </Suspense>
  );
}
