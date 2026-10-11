"use client";

// Tracks the pages visited in this tab (see history.ts) and short confirmation messages
// shown after a form returns to a page. Back links and forms use it instead of hard-coded
// routes, so the browser's Back button and the in-app back links always agree (D-035).

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { nextStack, pathOf, type NavKind } from "./history";

type Navigation = {
  /** The in-app page before the one at `pathname`, or null when there is none. */
  previousFor: (pathname: string) => string | null;
  /** Goes back in the browser history when possible, otherwise opens `fallback`. */
  back: (fallback: string) => void;
  /** Replaces the current history entry (filters, finished forms). */
  replace: (url: string) => void;
  /** After a form: shows `message` on `target`, going back to it when it is the previous page. */
  returnTo: (target: string, message?: string) => void;
  /** Leaves a message for the next page (`target`) to show once. */
  flash: (target: string, message: string) => void;
  flashFor: (pathname: string) => string;
};

const NavigationContext = createContext<Navigation | null>(null);

function Tracker({ onChange }: { onChange: (url: string) => void }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => onChange(search ? `${pathname}?${search}` : pathname), [pathname, search, onChange]);
  return null;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [stack, setStack] = useState<string[]>([]);
  const [message, setMessage] = useState<{ path: string; text: string } | null>(null);
  const kind = useRef<NavKind>("push");

  const onChange = useCallback((url: string) => {
    const k = kind.current;
    kind.current = "push";
    setStack((s) => nextStack(s, url, k));
    // A message is shown on one page only; leaving that page clears it.
    setMessage((m) => (m && m.path !== pathOf(url) ? null : m));
  }, []);

  const previousFor = useCallback(
    (pathname: string) => {
      const n = stack.length;
      if (n === 0) return null;
      if (pathOf(stack[n - 1]) === pathname) return n > 1 ? stack[n - 2] : null;
      // Right after a navigation the stack is not updated yet:
      // after going back, the current page is the one below the top; otherwise it is new.
      if (n > 1 && pathOf(stack[n - 2]) === pathname) return n > 2 ? stack[n - 3] : null;
      return stack[n - 1];
    },
    [stack],
  );

  const replace = useCallback(
    (url: string) => {
      kind.current = "replace";
      router.replace(url, { scroll: false });
    },
    [router],
  );

  const back = useCallback(
    (fallback: string) => {
      if (stack.length > 1) router.back();
      else router.push(fallback);
    },
    [stack.length, router],
  );

  const flash = useCallback((target: string, text: string) => setMessage({ path: pathOf(target), text }), []);

  const returnTo = useCallback(
    (target: string, text?: string) => {
      if (text) flash(target, text);
      const previous = stack.length > 1 ? stack[stack.length - 2] : null;
      if (previous && pathOf(previous) === pathOf(target)) router.back();
      else replace(target);
    },
    [stack, router, replace, flash],
  );

  const flashFor = useCallback((pathname: string) => (message && message.path === pathname ? message.text : ""), [message]);

  const value = useMemo(
    () => ({ previousFor, back, replace, returnTo, flash, flashFor }),
    [previousFor, back, replace, returnTo, flash, flashFor],
  );

  return (
    <NavigationContext.Provider value={value}>
      <Suspense fallback={null}>
        <Tracker onChange={onChange} />
      </Suspense>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const nav = useContext(NavigationContext);
  if (!nav) throw new Error("useNavigation must be used inside <NavigationProvider>");
  return nav;
}

/** The confirmation message left for the current page, if any. */
export function useFlashMessage() {
  const pathname = usePathname();
  return useNavigation().flashFor(pathname);
}
