"use client";

import Avatar from "@/components/Avatar";
import Card from "@/components/ui/Card";
import { coach } from "@/data/groups";
import MoreLinks from "./MoreLinks";
import { t } from "@/i18n";

/**
 * Profile (D-076): not a personal profile page, just the coach's name and avatar and one short list —
 * Calendar, Attendance, Settings. The demo switch is in the header.
 */
export default function ProfileView() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <div className="flex items-center gap-3">
        <Avatar name={coach.name} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-ink">{coach.name}</h1>
          <p className="truncate text-sm text-ink-soft">{coach.organisation}</p>
        </div>
      </div>
      <Card as="section" padded={false} className="mt-5 overflow-hidden" aria-label={t("nav.profile")}>
        <MoreLinks />
      </Card>
    </main>
  );
}
