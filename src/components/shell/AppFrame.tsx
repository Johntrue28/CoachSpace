"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import RoleSwitcher from "@/components/RoleSwitcher";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/** Pages shown without the app's navigation: the welcome screen (D-055). */
const BARE_PATHS = ["/demo"];

/**
 * The application frame: sidebar, mobile header and bottom navigation around every page, except
 * the welcome screen, which stands alone before the visitor enters the demo.
 */
export default function AppFrame({ children }: { children: React.ReactNode }) {
  const bare = BARE_PATHS.includes(usePathname());
  if (bare) return <>{children}</>;
  return (
    <>
      <a
        href="#content"
        className="sr-only rounded-control bg-card px-4 py-2 font-semibold text-brand-strong shadow-raised focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <RoleSwitcher variant="strip" className="lg:hidden" />
        <TopBar />
        <div id="content" tabIndex={-1} className="flex-1 pb-[calc(var(--bottom-nav-h)+1.5rem)] outline-none lg:pb-12">
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
