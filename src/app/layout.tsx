import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { DemoStoreProvider } from "@/data/store";

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
          <div className="mx-auto min-h-dvh max-w-md bg-surface pb-24">{children}</div>
          <BottomNav />
        </DemoStoreProvider>
      </body>
    </html>
  );
}
