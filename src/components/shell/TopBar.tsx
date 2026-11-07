"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/Avatar";
import { PlusIcon } from "@/components/Icons";
import RoleSwitcher from "@/components/RoleSwitcher";
import { Button } from "@/components/ui/Button";
import { useCreateMenu } from "./CreateMenu";
import { coach, DEMO_PARTICIPANT_ID, participantById } from "@/data/groups";
import Logo from "./Logo";
import { isActive, isParticipantPath, sectionTitle, headerNewSession, coachMore } from "./sections";

/**
 * Sticky header (D-071). Phones: logo, the compact demo switch and the avatar, which opens the menu
 * (Calendar, Attendance, Settings) for the coach. Desktop (next to the sidebar): section title and the
 * coach's "Create".
 */
export default function TopBar() {
  const pathname = usePathname();
  const participant = isParticipantPath(pathname);
  const name = participant ? (participantById(DEMO_PARTICIPANT_ID)?.name ?? "Participant") : coach.name;
  const menuActive = !participant && isActive("/more", pathname);
  const newSession = headerNewSession(pathname);
  const createMenu = useCreateMenu();
  const menuItems = coachMore;

  return (
    <header className="sticky top-0 z-30 flex h-(--shell-header-h) items-center justify-between gap-2 border-b border-line bg-card/90 px-4 backdrop-blur-md sm:px-6 lg:px-9">
      <div className="min-w-0 lg:hidden">
        <Logo href={participant ? "/me" : "/"} />
      </div>
      <div className="hidden min-w-0 lg:block">
        <p className="truncate text-sm font-semibold text-ink">{sectionTitle(pathname)}</p>
        <p className="truncate text-xs text-ink-soft">{participant ? `Player view · ${name}` : coach.organisation}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <RoleSwitcher variant="header" className="lg:hidden" />
        {newSession && (
          <span className="hidden lg:block">
            <Button variant={newSession} onClick={createMenu.open} aria-haspopup="dialog">
              <PlusIcon className="h-4 w-4" />
              Create
            </Button>
          </span>
        )}
        {participant ? (
          <span className="lg:hidden" title={name}>
            <Avatar name={name} size="sm" />
          </span>
        ) : (
          <Link
            href="/more"
            aria-label={`Menu: ${menuItems.map((i) => i.label.toLowerCase()).join(", ")}`}
            aria-current={menuActive ? "page" : undefined}
            className={`rounded-full lg:hidden ${menuActive ? "ring-2 ring-brand" : ""}`}
          >
            <Avatar name={name} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}
