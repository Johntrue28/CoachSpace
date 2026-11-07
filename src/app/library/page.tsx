import { Suspense } from "react";
import LibraryView from "@/components/library/LibraryView";
import LibraryRoute from "@/components/library/LibraryRoute";

export const metadata = { title: "Library · CoachSpace" };

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibraryView />}>
      <LibraryRoute />
    </Suspense>
  );
}
