// Navigation structure of the app shell (D-040, step 2): which destinations each view shows,
// which one is active and the section title in the desktop header. Pure, no React (unit tested).

export type IconKey = "home" | "calendar" | "groups" | "library" | "chat" | "announcements" | "attendance" | "video" | "more";

export type NavItem = { href: string; label: string; icon: IconKey };

const dashboard: NavItem = { href: "/", label: "Dashboard", icon: "home" };
const calendar: NavItem = { href: "/calendar", label: "Calendar", icon: "calendar" };
const groupsItem: NavItem = { href: "/groups", label: "Groups", icon: "groups" };
const library: NavItem = { href: "/library", label: "Exercise Library", icon: "library" };
const chat: NavItem = { href: "/chat", label: "Chat", icon: "chat" };
const announcements: NavItem = { href: "/announcements", label: "Announcements", icon: "announcements" };
const attendance: NavItem = { href: "/attendance", label: "Attendance", icon: "attendance" };
const more: NavItem = { href: "/more", label: "More", icon: "more" };

/** Desktop sidebar of the coach view, in the Figma order. */
export const coachSidebar: NavItem[] = [dashboard, calendar, groupsItem, library, chat, announcements, attendance];

/** Mobile bottom navigation of the coach view; secondary destinations live on /more. */
export const coachTabs: NavItem[] = [dashboard, calendar, groupsItem, chat, more];

/** Secondary destinations listed on the mobile /more page. */
export const coachMore: NavItem[] = [library, announcements, attendance];

/** The participant view (D-029) has no management sections; same items on desktop and mobile. */
export const participantNav: NavItem[] = [
  { href: "/me", label: "Home", icon: "home" },
  { href: "/me/calendar", label: "Calendar", icon: "calendar" },
  { href: "/me/videos", label: "My Videos", icon: "video" },
  { href: "/me/chat", label: "Chat", icon: "chat" },
];

/** True on participant-view pages (everything under /me). */
export function isParticipantPath(pathname: string) {
  return pathname === "/me" || pathname.startsWith("/me/");
}

function under(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True when `href` is the navigation item of the current page. */
export function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  // Participant home also covers the participant's group pages.
  if (href === "/me") return pathname === "/me" || under(pathname, "/me/groups");
  // "More" stands for every secondary destination it lists.
  if (href === "/more") return under(pathname, "/more") || coachMore.some((item) => under(pathname, item.href));
  return under(pathname, href);
}

/** Section title shown in the desktop header. */
export function sectionTitle(pathname: string) {
  if (isParticipantPath(pathname)) {
    return participantNav.find((item) => isActive(item.href, pathname))?.label ?? "Home";
  }
  if (under(pathname, "/more")) return "More";
  return coachSidebar.find((item) => isActive(item.href, pathname))?.label ?? "CoachSpace";
}
