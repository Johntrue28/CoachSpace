import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import RoleSwitcher from "@/components/RoleSwitcher";
import { DemoStoreProvider } from "@/data/store";
import { ChatStoreProvider } from "@/data/chat-store";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/** Browser bar colour. Keep in sync with --color-brand in globals.css. */
const brandColour = "#15803d";

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
    <html lang="en-GB" className={inter.variable}>
      <body className="antialiased font-sans">
        <DemoStoreProvider>
          <ChatStoreProvider>
            <NavigationProvider>
              <div className="mx-auto min-h-dvh max-w-md bg-surface pb-24">
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
