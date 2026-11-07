"use client";

import type { Session } from "@/data/types";
import { RSVP_ANSWERS, RSVP_LABEL, type RsvpAnswer } from "@/data/rsvp";
import { useRsvp } from "@/data/use-rsvp";
import { t } from "@/i18n";

const selected: Record<RsvpAnswer, string> = {
  going: "bg-brand-strong text-on-brand ring-brand-strong",
  maybe: "bg-attention-soft text-attention-ink ring-attention",
  "not-going": "bg-danger-soft text-danger ring-danger",
};

const icon: Record<RsvpAnswer, string> = { going: "M5 12.5l4.5 4.5L19 7.5", maybe: "M9.5 9a2.5 2.5 0 1 1 3.6 2.25c-.65.33-1.1.95-1.1 1.7V14m0 3.5h.01", "not-going": "M7 7l10 10M17 7L7 17" };

/**
 * A member's one-tap answer to "Are you coming?" (D-071), as in the team apps coaches know.
 * Tapping the selected answer again takes it back. Saved in this browser only; the coach view of the
 * same session shows it at once, but nothing is sent to anyone.
 */
export default function RsvpButtons({ session, participantId, size = "md" }: { session: Session; participantId: string; size?: "sm" | "md" }) {
  const rsvp = useRsvp();
  const current = rsvp.ready ? rsvp.answerOf(session, participantId) : undefined;
  const disabled = !rsvp.ready || session.status === "cancelled";
  return (
    <div role="group" aria-label={t("rsvp.areYouComing", { title: session.title })} className="grid grid-cols-3 gap-2">
      {RSVP_ANSWERS.map((answer) => {
        const on = current === answer;
        return (
          <button
            key={answer}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => rsvp.set(session.id, participantId, on ? null : answer)}
            className={`flex items-center justify-center gap-1.5 rounded-control font-semibold ring-1 ring-inset transition disabled:opacity-50 ${
              size === "sm" ? "min-h-10 px-2 text-xs" : "min-h-11 px-3 text-sm"
            } ${on ? selected[answer] : "bg-card text-ink ring-line hover:bg-surface"}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={icon[answer]} />
            </svg>
            {RSVP_LABEL[answer]}
          </button>
        );
      })}
    </div>
  );
}
