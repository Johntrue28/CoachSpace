import { Suspense } from "react";
import NewAnnouncementForm from "@/components/announcements/NewAnnouncementForm";
import { NewAnnouncementRoute } from "@/components/announcements/AnnouncementsRoute";

export const metadata = { title: "New announcement · CoachSpace" };

/** Built in advance; `?group=` is read in the browser (D-054). */
export default function NewAnnouncementPage() {
  return (
    <Suspense fallback={<NewAnnouncementForm />}>
      <NewAnnouncementRoute />
    </Suspense>
  );
}
