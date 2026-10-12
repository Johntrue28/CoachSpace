import { Loading } from "@/components/ui/EmptyState";

/**
 * Shown at once while a page that is not built in advance (a session, or an exercise or plan
 * created in this browser) comes from the server, so a tap always gets immediate feedback
 * (D-054). Pages built in advance open directly and never show it.
 */
export default function PageLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <div className="h-4 w-24 motion-safe:animate-pulse rounded bg-sunken" />
      <div className="mt-5 h-7 w-56 max-w-full motion-safe:animate-pulse rounded bg-sunken" />
      <div className="mt-6 h-32 motion-safe:animate-pulse rounded-card bg-sunken" />
      <Loading className="sr-only" />
    </main>
  );
}
