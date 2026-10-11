"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEMO_PARTICIPANT_ID, participantById } from "@/data/groups";

/** True on participant-view pages (everything under /me). */
export function isParticipantPath(pathname: string) {
  return pathname === "/me" || pathname.startsWith("/me/");
}

/**
 * Switches between the coach and participant views of the demo.
 * It only changes what is shown: there is no sign-in and no real permission check.
 */
export default function RoleSwitcher() {
  const participant = isParticipantPath(usePathname());
  const name = participantById(DEMO_PARTICIPANT_ID)?.name ?? "Participant";
  const option = (active: boolean) =>
    `flex-1 rounded-full px-3 py-1 text-center text-xs font-semibold ${active ? "bg-card text-brand-strong shadow-card" : "text-white/90"}`;

  return (
    <div className="bg-ink px-4 py-2 text-white">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-label font-semibold uppercase tracking-wide text-white/70">Demo view</span>
        <nav aria-label="Demo view" className="flex flex-1 rounded-full bg-white/15 p-0.5">
          <Link href="/" aria-current={!participant ? "page" : undefined} className={option(!participant)}>
            Coach
          </Link>
          <Link href="/me" aria-current={participant ? "page" : undefined} className={option(participant)}>
            Participant
          </Link>
        </nav>
      </div>
      <p className="mt-1 text-xs text-white/70">
        {participant ? `Seeing the app as ${name}, a fictional participant.` : "Seeing the app as the coach."} Role
        switch for the demo only — not a real sign-in.
      </p>
    </div>
  );
}
