"use client";

import "./globals.css";
import DemoErrorScreen from "@/components/errors/DemoErrorScreen";

/** An unexpected error in the root layout itself (for example the demo stores): a full page (D-069). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body className="antialiased font-sans bg-canvas">
        <DemoErrorScreen retry={reset} />
      </body>
    </html>
  );
}
