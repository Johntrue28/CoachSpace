import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import RoleSwitcher from "@/components/RoleSwitcher";
import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";
import { DemoStoreProvider } from "@/data/store";
import { ChatStoreProvider } from "@/data/chat-store";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

/** Browser bar colour. Keep in sync with --color-brand in globals.css. */
const brandColour = "#16a366";

export const metadata: Metadata = {
  title: "CoachSpace",
  description: "Manage your groups, training and communication in one place.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: brandColour,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={dmSans.variable}>
      <body className="antialiased font-sans">
        <DemoStoreProvider>
          <ChatStoreProvider>
            <NavigationProvider>
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
            </NavigationProvider>
          </ChatStoreProvider>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
