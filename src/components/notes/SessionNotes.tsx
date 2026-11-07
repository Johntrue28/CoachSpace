"use client";

import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { previousNotes } from "@/data/notes";
import { sessionStart } from "@/data/calendar";
import type { Session } from "@/data/types";
import { useNow } from "@/components/useNow";
import { cardClass } from "@/components/ui/Card";
import PreviousNotes from "./PreviousNotes";
import CoachNotes from "./CoachNotes";

/** One Notes block on the session page (D-076): "From last time" (read-only) and, once it has started, "Notes for next time". */
export default function SessionNotes({ session }: { session: Session }) {
  const { notes, ready } = useDemoStore();
  const { byId } = useSessions();
  const now = useNow();
  const earlier = ready ? previousNotes(notes, session.groupId, session, byId, 2).length : 0;
  const started = now ? sessionStart(session) <= now : false;
  return (
    <section aria-labelledby="notes-heading" className={cardClass({ className: "mt-4" })}>
      <h2 id="notes-heading" className="text-lg font-bold text-ink">
        Notes
      </h2>
      {ready && earlier === 0 && !started && <p className="mt-1 text-sm text-ink-soft">No notes from last time.</p>}
      <PreviousNotes groupId={session.groupId} before={session} embedded />
      <CoachNotes session={session} />
    </section>
  );
}
