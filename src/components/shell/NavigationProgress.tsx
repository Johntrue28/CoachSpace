"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin bar at the top of the screen while the next page loads (D-070), so a tap on a link never
 * looks ignored on a slow phone or network. It starts when a link to another page of the demo is
 * tapped, and disappears as soon as the new page is shown. It only appears after a short moment
 * (CSS), so instant navigations show nothing.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [pending, setPending] = useState<string | null>(null);

  // The new page is shown: stop.
  useEffect(() => setPending(null), [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setPending(url.pathname + url.search);
    };
    // Bubble phase, so links whose click is handled in place (preventDefault) are ignored.
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Never leave the bar on screen if a navigation does not finish.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(null), 10_000);
    return () => clearTimeout(t);
  }, [pending]);

  if (!pending) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div key={pending} data-nav-progress className="h-full bg-brand" />
    </div>
  );
}
