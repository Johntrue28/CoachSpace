import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import RoleSwitcher from "@/components/RoleSwitcher";
import { DemoStoreProvider } from "@/data/store";
import { ChatStoreProvider } from "@/data/chat-store";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";

export const metadata: Metadata = {
  title: "CoachSpace",
  description: "Manage your groups, training and communication in one place.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f6f4a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
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
