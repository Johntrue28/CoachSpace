// Small labels for states (Cancelled, Moved, Used in 2 groups…) and the unread counter.

export type BadgeTone = "neutral" | "brand" | "attention" | "danger" | "solid-brand" | "solid-danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-sunken text-ink",
  brand: "bg-brand-soft text-brand-strong",
  attention: "bg-attention-soft text-attention-ink",
  danger: "bg-danger-soft text-danger",
  "solid-brand": "bg-brand-strong text-on-brand",
  "solid-danger": "bg-danger text-on-brand",
};

export function badgeClass(tone: BadgeTone = "neutral", className = "") {
  return `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`.trim();
}

export default function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={badgeClass(tone, className)}>{children}</span>;
}

/**
 * The unread counter, one style everywhere. `text` is already formatted ("3", "5+").
 * `overlay` places it on the corner of an icon.
 */
export function CountBadge({ text, overlay = false }: { text: string; overlay?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-grid h-5 min-w-5 place-items-center rounded-full bg-brand-strong px-1.5 text-xs font-bold tabular-nums leading-none text-on-brand ${
        overlay ? "absolute -right-2 -top-1.5 ring-2 ring-card" : ""
      }`}
    >
      {text}
    </span>
  );
}
