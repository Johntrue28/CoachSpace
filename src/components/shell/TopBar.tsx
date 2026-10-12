"use client";

import { usePathname } from "next/navigation";
import Avatar from "@/components/Avatar";
import { PlusIcon } from "@/components/Icons";
import { ButtonLink } from "@/components/ui/Button";
import { coach, DEMO_PARTICIPANT_ID, participantById } from "@/data/groups";
import ActivityBell from "./ActivityBell";
import Logo from "./Logo";
import { isParticipantPath, sectionTitle } from "./sections";

/**
 * Sticky header. Mobile: logo, activity bell and avatar. Desktop (from 1024 px, next to the
 * sidebar): section title and organisation, activity bell and the coach's "New session" action.
 */
export default function TopBar() {
  const pathname = usePathname();
  const participant = isParticipantPath(pathname);
  const name = participant ? (participantById(DEMO_PARTICIPANT_ID)?.name ?? "Participant") : coach.name;

  return (
    <header className="sticky top-0 z-30 flex h-(--shell-header-h) items-center justify-between gap-3 border-b border-line bg-card/90 px-4 backdrop-blur-md sm:px-6 lg:px-9">
      <div className="lg:hidden">
        <Logo href={participant ? "/me" : "/"} />
      </div>
      <div className="hidden min-w-0 lg:block">
        <p className="truncate text-sm font-semibold text-ink">{sectionTitle(pathname)}</p>
        <p className="truncate text-xs text-ink-soft">{participant ? `Participant view · ${name}` : coach.organisation}</p>
      </div>

      <div className="flex items-center gap-2">
        <ActivityBell participant={participant} />
        {!participant && (
          <span className="hidden sm:block">
            <ButtonLink href="/calendar/new">
              <PlusIcon className="h-4 w-4" />
              New session
            </ButtonLink>
          </span>
        )}
        <div className="ml-1 lg:hidden" title={name}>
          <Avatar name={name} size="sm" />
        </div>
      </div>
    </header>
  );
}
