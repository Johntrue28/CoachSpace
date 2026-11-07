import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AppFrame from "@/components/shell/AppFrame";
import { DemoStoreProvider, GroupDataBoundary } from "@/data/store";
import { ScenarioProvider } from "@/data/scenario-store";
import { scenarioBootScript } from "@/data/persistence";
import { ChatStoreProvider } from "@/data/chat-store";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import NavigationProgress from "@/components/shell/NavigationProgress";
import { CreateMenuProvider } from "@/components/shell/CreateMenu";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

/** Browser bar colour. Keep in sync with --color-brand in globals.css. */
const brandColour = "#1d4ed8";

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
    // suppressHydrationWarning: the inline script below may add `data-scenario-loading` to <html>
    // before React starts, to hide the page while a saved scenario is applied (D-053).
    <html lang="en-GB" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scenarioBootScript }} />
      </head>
      <body className="antialiased font-sans">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <LanguageProvider>
          <ScenarioProvider>
            <DemoStoreProvider>
              <ChatStoreProvider>
                <NavigationProvider>
                  <GroupDataBoundary>
                    <CreateMenuProvider>
                      <AppFrame>{children}</AppFrame>
                    </CreateMenuProvider>
                  </GroupDataBoundary>
                </NavigationProvider>
              </ChatStoreProvider>
            </DemoStoreProvider>
          </ScenarioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
