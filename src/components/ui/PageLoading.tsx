import { Loading } from "./EmptyState";

/**
 * Shown at once while a page that is not built in advance (a session, or an exercise or plan
 * created in this browser) comes from the server, so a tap always gets immediate feedback
 * (D-054). Used by the loading.tsx files of those routes only, so pages built in advance are
 * never wrapped in it. A <div>, not a <main>: the page brings its own <main>.
 */
export default function PageLoading() {
  return (
    <div aria-busy="true" className="mx-auto w-full max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <div className="h-4 w-24 rounded bg-sunken motion-safe:animate-pulse" />
      <div className="mt-5 h-7 w-56 max-w-full rounded bg-sunken motion-safe:animate-pulse" />
      <div className="mt-6 h-32 rounded-card bg-sunken motion-safe:animate-pulse" />
      <Loading className="sr-only" />
    </div>
  );
}
