"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { previousNotes } from "@/data/notes";
import type { Session } from "@/data/types";
import { formatDateKey } from "@/components/format";

/** Notes from this group's earlier sessions, shown while preparing the next one. */
export default function PreviousNotes({
  groupId,
  before,
  limit = 2,
}: {
  groupId: string;
  before: Pick<Session, "date" | "time"> | null;
  limit?: number;
}) {
  const { notes, ready } = useDemoStore();
  const { byId } = useSessions();
  if (!ready) return null;
  const list = previousNotes(notes, groupId, before, byId, limit);
  if (list.length === 0) return null;

  return (
    <section className="mt-4 rounded-2xl border-l-4 border-accent bg-card p-4 ring-1 ring-line" aria-labelledby="previous-notes">
      <h2 id="previous-notes" className="font-bold">
        From last time
      </h2>
      <ul className="mt-2 space-y-3">
        {list.map(({ note, session }) => {
          const full = byId(note.sessionId);
          return (
            <li key={note.sessionId} className="text-sm">
              <Link href={`/calendar/${note.sessionId}`} className="text-xs font-semibold text-brand-strong">
                {full?.title ?? "Session"} · {formatDateKey(session.date)}
              </Link>
              <dl className="mt-1 space-y-1">
                {note.worked && <Row label="Worked" text={note.worked} />}
                {note.improve && <Row label="Improve" text={note.improve} />}
                {note.revisit && <Row label="Revisit" text={note.revisit} />}
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Row({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 font-semibold">{label}</dt>
      <dd className="text-ink-soft">{text}</dd>
    </div>
  );
}
