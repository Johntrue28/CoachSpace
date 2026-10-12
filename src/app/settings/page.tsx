import { Suspense } from "react";
import SettingsView, { SettingsScreen } from "@/components/settings/SettingsView";

export const metadata = { title: "Settings · CoachSpace" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsScreen />}>
      <SettingsView />
    </Suspense>
  );
}
