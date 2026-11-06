import type { RsvpSummary } from "@/data/rsvp";
import { summaryText } from "@/data/rsvp";

/**
 * Who is coming at a glance (D-071): a thin bar split into going, maybe, not going and no reply,
 * with the counts in words underneath (the colours never carry the meaning alone).
 */
export default function RsvpBar({ summary, compact = false }: { summary: RsvpSummary; compact?: boolean }) {
  const { going, maybe, notGoing, noReply, total } = summary;
  const pct = (n: number) => `${total ? (n / total) * 100 : 0}%`;
  return (
    <div className="min-w-0">
      <div className={`flex overflow-hidden rounded-full bg-sunken ${compact ? "h-1.5" : "h-2"}`} aria-hidden="true">
        <span className="bg-brand" style={{ width: pct(going) }} />
        <span className="bg-attention/70" style={{ width: pct(maybe) }} />
        <span className="bg-danger/70" style={{ width: pct(notGoing) }} />
        <span style={{ width: pct(noReply) }} />
      </div>
      <p className={`mt-1 truncate tabular-nums ${compact ? "text-xs" : "text-sm"} text-ink-soft`}>
        <span className="font-semibold text-ink">{going}</span>
        {summaryText(summary).slice(String(going).length)}
      </p>
    </div>
  );
}
