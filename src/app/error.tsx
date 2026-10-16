"use client";

import DemoErrorScreen from "@/components/errors/DemoErrorScreen";

/** An unexpected error in a page: a friendly screen inside the app (D-069). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <DemoErrorScreen retry={reset} />;
}
