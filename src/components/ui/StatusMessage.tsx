import { AlertIcon, CheckIcon, DeviceIcon } from "@/components/Icons";

// Confirmations, errors and demo notes, styled the same on every screen.

export type StatusTone = "success" | "error" | "demo";

const tones: Record<StatusTone, { box: string; Icon: (p: { className?: string }) => React.ReactElement }> = {
  success: { box: "bg-success-soft text-success-ink", Icon: CheckIcon },
  error: { box: "bg-danger-soft text-danger-ink", Icon: AlertIcon },
  demo: { box: "bg-attention-soft text-ink", Icon: DeviceIcon },
};

export function statusClass(tone: StatusTone, className = "") {
  return `flex items-start gap-2 rounded-control px-3 py-2 text-sm ${tones[tone].box} ${className}`.trim();
}

export default function StatusMessage({
  tone = "success",
  className = "",
  children,
}: {
  tone?: StatusTone;
  className?: string;
  children: React.ReactNode;
}) {
  const { Icon } = tones[tone];
  return (
    // Demo notes are static text, not announcements, so they get no live role.
    <div role={tone === "error" ? "alert" : tone === "success" ? "status" : undefined} className={statusClass(tone, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * A live region that is always in the page (so screen readers announce changes) and only
 * shows the success style when there is a message.
 */
export function LiveStatus({ message, className = "" }: { message: string; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={message ? statusClass("success", `font-medium ${className}`) : "sr-only"}>
      {message && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />}
      {message}
    </p>
  );
}
