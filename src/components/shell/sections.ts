// Navigation structure of the app shell (D-040, step 2): which destinations each view shows,
// which one is active and the section title in the desktop header. Pure, no React (unit tested).

import { t } from "@/i18n";
export type IconKey = "home" | "calendar" | "groups" | "library" | "chat" | "announcements" | "attendance" | "video" | "settings" | "more";

export type NavItem = { href: string; label: string; icon: IconKey };

// Event-centred navigation (D-071): four places for the coach, three for the participant, like the
// team apps coaches already know. Calendar (month view), Attendance and Settings are secondary: the
// Profile (the avatar, /more) on phones and a smaller "Profile" list in the desktop sidebar (D-076).
const home: NavItem = { href: "/", get label() { return t("nav.home"); }, icon: "home" };
const groupsItem: NavItem = { href: "/groups", get label() { return t("nav.groups"); }, icon: "groups" };
const library: NavItem = { href: "/library", get label() { return t("nav.library"); }, icon: "library" };
const messages: NavItem = { href: "/chat", get label() { return t("nav.messages"); }, icon: "chat" };
const calendar: NavItem = { href: "/calendar", get label() { return t("nav.calendar"); }, icon: "calendar" };
const attendance: NavItem = { href: "/attendance", get label() { return t("nav.attendance"); }, icon: "attendance" };
const settings: NavItem = { href: "/settings", get label() { return t("nav.settings"); }, icon: "settings" };

/** The coach's main destinations: the desktop sidebar and the mobile tabs. */
export const coachSidebar: NavItem[] = [home, groupsItem, library, messages];

/** Mobile bottom navigation of the coach view (the same four places). */
export const coachTabs: NavItem[] = coachSidebar;

/** Profile (D-076): /more on phones (the avatar) and the lower sidebar list on desktop. */
export const coachMore: NavItem[] = [calendar, attendance, settings];

/** The participant view (D-029): their Home with answers, their exercises and messages. */
export const participantNav: NavItem[] = [
  { href: "/me", get label() { return t("nav.home"); }, icon: "home" },
  { href: "/me/videos", get label() { return t("nav.exercises"); }, icon: "video" },
  { href: "/me/chat", get label() { return t("nav.messages"); }, icon: "chat" },
];

/** True on participant-view pages (everything under /me). */
export function isParticipantPath(pathname: string) {
  return pathname === "/me" || pathname.startsWith("/me/");
}

function under(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True when `href` is the navigation item of the current page. */
export function isActive(href: string, pathname: string): boolean {
  // Home also covers a session's pages (the event hub), but not the month calendar or new sessions.
  if (href === "/") return pathname === "/" || (pathname.startsWith("/calendar/") && pathname !== "/calendar/new");
  if (href === "/calendar") return pathname === "/calendar" || pathname === "/calendar/new";
  // Messages are chats and announcements together.
  if (href === "/chat") return under(pathname, "/chat") || under(pathname, "/announcements");
  if (href === "/me") return pathname === "/me" || under(pathname, "/me/calendar");
  if (href === "/me/chat") return under(pathname, "/me/chat") || under(pathname, "/me/announcements");
  // The header menu stands for every secondary destination it lists.
  if (href === "/more") return under(pathname, "/more") || coachMore.some((item): boolean => isActive(item.href, pathname));
  return under(pathname, href);
}

/** Section title shown in the desktop header. */
export function sectionTitle(pathname: string) {
  if (isParticipantPath(pathname)) {
    return participantNav.find((item) => isActive(item.href, pathname))?.label ?? t("nav.home");
  }
  if (under(pathname, "/more")) return t("nav.profile");
  return [...coachSidebar, ...coachMore].find((item) => isActive(item.href, pathname))?.label ?? t("nav.app");
}

/**
 * How the desktop header shows the coach's "New session" (R8, one primary action per screen): the
 * primary button on Home, hidden where the page already offers
 * it (Calendar, the new-session form), and a quieter secondary button on every other coach page.
 */
export function headerNewSession(pathname: string): "primary" | "secondary" | null {
  if (isParticipantPath(pathname)) return null;
  if (pathname === "/calendar" || pathname === "/calendar/new") return null;
  return pathname === "/" ? "primary" : "secondary";
}
