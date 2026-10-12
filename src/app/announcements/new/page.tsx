import { Suspense } from "react";
import { NewAnnouncementFallback, NewAnnouncementRoute } from "@/components/announcements/AnnouncementsRoute";

export const metadata = { title: "New announcement · CoachSpace" };

/** Built in advance; `?group=` is read in the browser (D-054). */
export default function NewAnnouncementPage() {
  return (
    <Suspense fallback={<NewAnnouncementFallback />}>
      <NewAnnouncementRoute />
    </Suspense>
  );
}
