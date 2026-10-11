import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import RoleSwitcher from "@/components/RoleSwitcher";
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
              <div className="mx-auto min-h-dvh max-w-md bg-canvas pb-24">
                <RoleSwitcher />
                {children}
              </div>
              <BottomNav />
            </NavigationProvider>
          </ChatStoreProvider>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
