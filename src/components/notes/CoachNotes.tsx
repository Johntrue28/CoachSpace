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
import { t } from "@/i18n";

const fields = [
  { key: "worked", label: () => t("notes.whatWorked") },
  { key: "improve", label: () => t("notes.whatImprove") },
  { key: "revisit", label: () => t("notes.whatRevisit") },
] as const;

type Draft = Record<(typeof fields)[number]["key"], string>;

/** "Notes for next time": the coach's three short notes once the session has started. Private to the coach. */
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

  if (now && loaded && !started && !saved) return null;

  return (
    <section className="mt-4 border-t border-line pt-4" aria-labelledby="coach-notes">
      <h3 id="coach-notes" className="font-bold">
        {t("notes.nextTime")}
      </h3>
      <p className="text-xs text-ink-soft">{t("notes.private")}</p>

      {!now || !loaded ? (
        <Loading className="mt-2" />
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveNote({ sessionId: session.id, groupId: session.groupId, ...draft });
            setStatus(Object.values(draft).some((v) => v.trim()) ? t("notes.saved") : t("notes.removed"));
          }}
        >
          {fields.map((f) => (
            <label key={f.key} className="block text-sm font-semibold">
              {f.label()}
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
            {t("notes.save")}
          </button>
          <p role="status" aria-live="polite" className="text-center text-xs font-medium text-brand-strong">
            {status}
          </p>
        </form>
      )}
    </section>
  );
}
