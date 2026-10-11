"use client";

import { useEffect, useState } from "react";
import { useDemoStore } from "@/data/store";
import { sessionStart } from "@/data/calendar";
import { NOTE_MAX, noteForSession } from "@/data/notes";
import type { Session } from "@/data/types";
import { inputClass } from "@/components/Form";
import { useNow } from "@/components/useNow";
import { buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";

const fields = [
  { key: "worked", label: "What worked" },
  { key: "improve", label: "What to improve" },
  { key: "revisit", label: "What to revisit next time" },
] as const;

type Draft = Record<(typeof fields)[number]["key"], string>;

/** The coach's three short notes after a session. Private to the coach. */
export default function CoachNotes({ session }: { session: Session }) {
  const { notes, ready, saveNote } = useDemoStore();
  const now = useNow();
  const saved = noteForSession(notes, session.id);
  const [draft, setDraft] = useState<Draft>({ worked: "", improve: "", revisit: "" });
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!ready || loaded) return;
    if (saved) setDraft({ worked: saved.worked, improve: saved.improve, revisit: saved.revisit });
    setLoaded(true);
  }, [ready, loaded, saved]);

  const started = now ? sessionStart(session) <= now : false;

  return (
    <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line" aria-labelledby="coach-notes">
      <h2 id="coach-notes" className="font-bold">
        Coach notes
      </h2>
      <p className="text-xs text-ink-soft">Only you see these. They come back when you prepare this group&apos;s next session.</p>

      {!now || !loaded ? (
        <Loading className="mt-2" />
      ) : !started && !saved ? (
        <p className="mt-2 text-sm text-ink-soft">You can add notes once the session has started.</p>
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveNote({ sessionId: session.id, groupId: session.groupId, ...draft });
            setStatus(Object.values(draft).some((v) => v.trim()) ? "Notes saved on this device." : "Notes removed.");
          }}
        >
          {fields.map((f) => (
            <label key={f.key} className="block text-sm font-semibold">
              {f.label}
              <textarea
                value={draft[f.key]}
                onChange={(e) => {
                  setStatus("");
                  setDraft((d) => ({ ...d, [f.key]: e.target.value }));
                }}
                maxLength={NOTE_MAX}
                rows={2}
                className={`${inputClass} mt-1.5 font-normal`}
              />
            </label>
          ))}
          <button type="submit" className={buttonClass({ block: true })}>
            Save notes
          </button>
          <p role="status" aria-live="polite" className="text-center text-xs font-medium text-brand">
            {status}
          </p>
        </form>
      )}
    </section>
  );
}
