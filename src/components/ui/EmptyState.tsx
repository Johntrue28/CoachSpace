// What a list shows when it has nothing in it, and short loading placeholders.

import { t } from "@/i18n";
/**
 * A small court with a ball (D-074): the illustration of every empty list, drawn with the palette so it
 * needs no image or licence. Decorative.
 */
export function EmptyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 72" className={`h-16 w-28 ${className}`} aria-hidden="true">
      <rect x="4" y="8" width="112" height="60" rx="10" fill="var(--color-brand-soft)" />
      <rect x="16" y="18" width="88" height="40" rx="3" fill="none" stroke="var(--color-brand)" strokeWidth="2" opacity="0.55" />
      <path d="M60 18v40M16 38h88" stroke="var(--color-brand)" strokeWidth="2" opacity="0.55" />
      <circle cx="84" cy="27" r="7" fill="var(--color-lime)" stroke="var(--color-navy)" strokeWidth="1.5" />
      <path d="M79 23c3 2 3 6 0 8M89 23c-3 2-3 6 0 8" stroke="var(--color-navy)" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M30 50l6-8 6 8z" fill="var(--color-navy)" opacity="0.85" />
    </svg>
  );
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`fade-in grid justify-items-center gap-1.5 rounded-card bg-card px-4 py-8 text-center ring-1 ring-line ${className}`}
    >
      <div className="relative mb-1">
        <EmptyIllustration />
        {icon && <div className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-card text-ink-soft shadow-card ring-1 ring-line">{icon}</div>}
      </div>
      {title && <p className="font-semibold">{title}</p>}
      {description && <p className="text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** "Loading…" while the saved demo data is read in the browser. `block` adds room around it. */
export function Loading({ block = false, className = "" }: { block?: boolean; className?: string }) {
  return (
    <p className={`text-sm text-ink-soft ${block ? "py-10 text-center" : ""} ${className}`.trim()}>
      {t("common.loading")}
    </p>
  );
}
