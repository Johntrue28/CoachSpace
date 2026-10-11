// In-app navigation history (D-035). Pure functions, no React.
//
// The app keeps its own list of the URLs visited in this tab, so a back link can use the
// browser's history (router.back) when there is a previous in-app page, and a sensible
// parent page when the page was opened directly (no in-app history).

/** How the URL changed: a new entry or a replaced entry (filters, finished forms). */
export type NavKind = "push" | "replace";

/**
 * The visited pages after a URL change. Arriving at the previous page counts as going back,
 * whether it was the browser's Back button, router.back() or a link to that page: this does
 * not depend on the order of browser events, and at worst the app thinks there is less
 * history than there is and uses the page's parent instead.
 */
export function nextStack(stack: string[], url: string, kind: NavKind): string[] {
  if (stack[stack.length - 1] === url) return stack;
  if (kind === "replace") return [...stack.slice(0, -1), url];
  if (stack.length > 1 && stack[stack.length - 2] === url) return stack.slice(0, -1);
  return [...stack, url];
}

export function previousUrl(stack: string[]) {
  return stack.length > 1 ? stack[stack.length - 2] : null;
}

export function pathOf(url: string) {
  return url.split(/[?#]/)[0] || "/";
}

export type NameLookup = {
  group?: (id: string) => string | undefined;
  exercise?: (id: string) => string | undefined;
};

/** A short label for the page at `url`, used by back links ("← U12 Football"). */
export function labelForUrl(url: string, names: NameLookup = {}): string {
  const parts = pathOf(url).split("/").filter(Boolean);
  const [a, b, c] = parts[0] === "me" ? parts.slice(1) : parts;
  const participant = parts[0] === "me";
  if (!a) return "Home";
  switch (a) {
    case "groups":
      return b ? (names.group?.(b) ?? "Group") : "Groups";
    case "calendar":
      return b && b !== "new" ? "Session" : "Calendar";
    case "chat":
      return b ? "Chat" : "Chats";
    case "announcements":
      return "Announcements";
    case "attendance":
      return "Attendance";
    case "videos":
      return b ? "Exercise" : "My Videos";
    case "library":
      if (b === "plans") return c ? "Plan" : "Session plans";
      return b && b !== "new" ? (names.exercise?.(b) ?? "Exercise") : "Library";
    default:
      return participant ? "Home" : "Back";
  }
}
