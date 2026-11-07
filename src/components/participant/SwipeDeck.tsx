"use client";

import { useRef, useState } from "react";
import type { Session } from "@/data/types";
import type { useRsvp } from "@/data/use-rsvp";
import { answerFromSwipe, countdown, sessionPhoto } from "@/data/look";
import { colourOf, disciplineOf, groupName } from "@/data/groups";
import { sessionStart, toDateKey } from "@/data/calendar";
import { RSVP_LABEL, type RsvpAnswer } from "@/data/rsvp";
import { agendaDayLabel } from "@/components/format";
import Photo from "@/components/ui/Photo";

const stamp: Record<RsvpAnswer, { text: string; cls: string }> = {
  going: { text: "GOING ✓", cls: "border-success text-success -rotate-12 left-4" },
  "not-going": { text: "CAN'T GO ✕", cls: "border-danger text-danger rotate-12 right-4" },
  maybe: { text: "MAYBE ?", cls: "border-attention text-attention-ink left-1/2 -translate-x-1/2" },
};
const buttonTone: Record<RsvpAnswer, string> = {
  "not-going": "bg-danger-soft text-danger-ink",
  maybe: "bg-attention-soft text-attention-ink",
  going: "bg-success-soft text-success-ink",
};

/**
 * "Are you coming?" as a card the player swipes (D-074): right for going, left for can't go, up for maybe —
 * the gesture of the apps they already use. The three buttons do the same for anyone who prefers to tap,
 * and with the keyboard. Answers are saved in this browser only.
 */
export default function SwipeDeck({ sessions, now, rsvp, participantId }: { sessions: Session[]; now: Date; rsvp: ReturnType<typeof useRsvp>; participantId: string }) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [leaving, setLeaving] = useState<RsvpAnswer | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  // The latest drag, read on release: state can lag one frame behind a fast swipe.
  const moved = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const waiting = sessions.filter((s) => s.status !== "cancelled" && sessionStart(s) > now && !rsvp.answerOf(s, participantId));
  const s = waiting[0];
  const today = toDateKey(now);

  function answer(a: RsvpAnswer) {
    if (!s || leaving) return;
    setLeaving(a);
    // Let the card fly out, then record the answer (the next card takes its place).
    window.setTimeout(() => {
      rsvp.set(s.id, participantId, a);
      setLeaving(null);
      setDrag(null);
    }, 220);
  }

  if (!rsvp.ready) return null;
  if (!s) {
    return (
      <div className="fade-in rounded-[1.5rem] bg-success-soft p-5 text-center text-success-ink ring-1 ring-success/20">
        <p className="text-2xl" aria-hidden="true">🎉</p>
        <p className="mt-1 font-bold">All answered</p>
        <p className="text-sm">Your coach can see your answers. You can change them below.</p>
      </div>
    );
  }

  const live = drag ? answerFromSwipe(drag.x, drag.y) : null;
  const fly = leaving === "going" ? "translate(140%, 0) rotate(18deg)" : leaving === "not-going" ? "translate(-140%, 0) rotate(-18deg)" : leaving === "maybe" ? "translate(0, -130%)" : null;
  const transform = fly ?? (drag ? `translate(${drag.x}px, ${Math.min(drag.y, 40)}px) rotate(${drag.x / 18}deg)` : undefined);

  return (
    <section aria-labelledby="swipe-title">
      <h2 id="swipe-title" className="sr-only">
        Are you coming? {waiting.length} waiting for your answer
      </h2>
      <div className="relative h-72 select-none sm:h-80">
        {waiting[1] && <div className="absolute inset-x-4 bottom-0 top-4 rounded-[1.5rem] bg-card ring-1 ring-line" aria-hidden="true" />}
        <div
          key={s.id}
          data-session={s.id}
          onPointerDown={(e) => {
            start.current = { x: e.clientX, y: e.clientY };
            moved.current = { x: 0, y: 0 };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!start.current) return;
            moved.current = { x: e.clientX - start.current.x, y: e.clientY - start.current.y };
            setDrag(moved.current);
          }}
          onPointerUp={(e) => {
            if (start.current) moved.current = { x: e.clientX - start.current.x, y: e.clientY - start.current.y };
            const a = answerFromSwipe(moved.current.x, moved.current.y);
            start.current = null;
            if (a) answer(a);
            else setDrag(null);
          }}
          onPointerCancel={() => {
            start.current = null;
            setDrag(null);
          }}
          style={{ transform, transition: drag && !leaving ? "none" : "transform 220ms ease-out", touchAction: "pan-y" }}
          className="fade-in absolute inset-x-0 bottom-4 top-0 cursor-grab overflow-hidden rounded-[1.5rem] bg-navy text-on-brand shadow-raised active:cursor-grabbing"
        >
          <Photo name={sessionPhoto(s.id, disciplineOf(s.groupId))} alt="" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/10 via-navy/40 to-navy" aria-hidden="true" />
          <span className="absolute right-3 top-3 rounded-full bg-lime px-2.5 py-1 text-xs font-bold text-on-lime">{countdown(now, sessionStart(s))}</span>
          <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-on-brand" style={{ backgroundColor: colourOf(s.groupId).solid }}>
            {groupName(s.groupId)}
          </span>
          {(live || leaving) && (
            <span className={`absolute top-14 rounded-control border-4 bg-card/95 px-3 py-1 text-xl font-black ${stamp[(leaving ?? live)!].cls}`} aria-hidden="true">
              {stamp[(leaving ?? live)!].text}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-label font-bold uppercase tracking-wider text-on-brand/85">
              {agendaDayLabel(s.date, today)} · {s.time}
            </p>
            <p className="text-xl font-bold leading-tight">{s.title}</p>
            <p className="text-sm text-on-brand/85">{s.place}</p>
            <p className="mt-1 text-xs font-semibold text-on-brand/80">
              {waiting.length > 1 ? `${waiting.length - 1} more waiting after this one` : "The last one waiting for your answer"}
            </p>
          </div>
        </div>
      </div>
      <div role="group" aria-label={`Are you coming to ${s.title}?`} className="mt-1 grid grid-cols-3 gap-2">
        {(["not-going", "maybe", "going"] as const).map((a) => (
          <button key={a} type="button" onClick={() => answer(a)} className={`press min-h-12 rounded-control text-sm font-bold ${buttonTone[a]}`}>
            {a === "going" ? "✓ " : a === "maybe" ? "? " : "✕ "}
            {RSVP_LABEL[a]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-ink-soft">
        Swipe right for going, left if you can&rsquo;t go, up for maybe. Saved in this browser only.
      </p>
    </section>
  );
}
