"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEMO_PARTICIPANT_ID, participantById } from "@/data/groups";
import { isParticipantPath } from "@/components/shell/sections";

export { isParticipantPath };

/**
 * Switches between the coach and participant views of the demo.
 * It only changes what is shown: there is no sign-in and no real permission check (D-029).
 * `strip`: one compact line above the mobile header. `panel`: the sidebar and the More page.
 */
export default function RoleSwitcher({ variant, className = "" }: { variant: "header" | "strip" | "panel"; className?: string }) {
  const participant = isParticipantPath(usePathname());
  const name = participantById(DEMO_PARTICIPANT_ID)?.name ?? "Participant";

  const switcher = (
    <nav aria-label="Demo view (not a real sign-in)" className="flex shrink-0 rounded-full bg-card p-0.5 ring-1 ring-line">
      {[
        { href: "/", label: "Coach", active: !participant },
        { href: "/me", label: variant === "header" ? "Player" : "Participant", active: participant },
      ].map((o) => (
        <Link
          key={o.href}
          href={o.href}
          aria-current={o.active ? "page" : undefined}
          className={`flex-1 rounded-full ${variant === "header" ? "px-2.5" : "px-3"} py-1.5 text-center text-xs font-semibold transition ${
            o.active ? "bg-brand-strong text-on-brand" : "text-ink hover:bg-surface"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );

  // One small pill in the mobile header (D-071): the demo switch without a second bar.
  if (variant === "header") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <span className="hidden rounded-full bg-attention-soft px-1.5 py-0.5 text-label font-bold uppercase tracking-wide text-attention-ink min-[430px]:inline" title="Demo view, not a real sign-in">
          Demo
        </span>
        {switcher}
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className={`flex items-center justify-between gap-3 border-b border-line bg-sunken px-4 py-1.5 ${className}`}>
        <p className="min-w-0 text-label font-semibold text-ink">
          <span className="uppercase tracking-wide">Demo view</span>
          <span className="font-normal"> · {participant ? `${name}, a fictional participant` : "not a real sign-in"}</span>
        </p>
        {switcher}
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-label font-semibold uppercase tracking-widest text-ink-soft">Demo view</p>
      <div className="mt-2">{switcher}</div>
      <p className="mt-2 text-xs text-ink-soft">
        {participant ? `Seeing the app as ${name}, a fictional participant.` : "Seeing the app as the coach."} Not a real
        sign-in.
      </p>
    </div>
  );
}
