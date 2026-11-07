"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { colourOf, groups } from "@/data/groups";
import Sheet from "@/components/ui/Sheet";
import Avatar from "@/components/Avatar";
import { CalendarIcon, ChevronRightIcon, LinkIcon, MegaphoneIcon, PlusIcon, UsersIcon } from "@/components/Icons";

type CreateMenu = { open: () => void };
const Ctx = createContext<CreateMenu>({ open: () => {} });

/** Opens the coach's "Create" sheet from the bottom navigation's + button or the desktop header. */
export function useCreateMenu() {
  return useContext(Ctx);
}

/**
 * The coach's create menu (D-074, D-076), like Strava's central record button, one tap away from every screen:
 * a session, an announcement, an invitation and a group.
 */
export function CreateMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const pathname = usePathname();
  const close = useCallback(() => {
    setOpen(false);
    setInviting(false);
  }, []);
  const value = useMemo(() => ({ open: () => setOpen(true) }), []);

  // Exactly four things to create (D-076).
  const items = [
    { href: "/calendar/new", icon: CalendarIcon, title: "New session", detail: "A match, an extra or a make-up session" },
    { href: "/announcements/new", icon: MegaphoneIcon, title: "Announcement", detail: "For one group or all of them" },
    { action: () => setInviting(true), icon: LinkIcon, title: "Invite players", detail: "A link or QR code (demo)" },
    { href: "/groups/new", icon: UsersIcon, title: "New group", detail: "Name, weekly sessions and place" },
  ];

  return (
    <Ctx.Provider value={value}>
      {children}
      {!pathname.startsWith("/me") && (
        <Sheet open={open} onClose={close} title={inviting ? "Invite players to which group?" : "Create"}>
          {inviting ? (
            <ul className="-mx-4 divide-y divide-line border-y border-line sm:mx-0 sm:rounded-control sm:border sm:border-line">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link href={`/groups/${g.id}?invite=1`} onClick={close} className="press flex min-h-14 items-center gap-3 px-4 py-2.5 hover:bg-surface">
                    <Avatar name={g.name} size="sm" colour={colourOf(g.id)} />
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink">{g.name}</span>
                    <ChevronRightIcon className="h-5 w-5 text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="-mx-4 divide-y divide-line border-y border-line sm:mx-0 sm:rounded-control sm:border sm:border-line">
              {items.map((it) => {
                const inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-strong" aria-hidden="true">
                      <it.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block font-semibold text-ink">{it.title}</span>
                      <span className="block truncate text-sm text-ink-soft">{it.detail}</span>
                    </span>
                    <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
                  </>
                );
                const cls = "press flex min-h-16 w-full items-center gap-3 px-4 py-2.5 hover:bg-surface";
                return (
                  <li key={it.title}>
                    {"href" in it && it.href ? (
                      <Link href={it.href} onClick={close} className={cls}>
                        {inner}
                      </Link>
                    ) : (
                      <button type="button" onClick={"action" in it ? it.action : undefined} className={cls}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Sheet>
      )}
    </Ctx.Provider>
  );
}

/** The + button in the middle of the coach's bottom navigation. */
export function CreateButton() {
  const { open } = useCreateMenu();
  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-label="Create"
      className="press -mt-5 grid h-14 w-14 place-items-center rounded-[1.1rem] bg-navy text-on-brand shadow-raised ring-4 ring-canvas"
    >
      <PlusIcon className="h-7 w-7" />
    </button>
  );
}
