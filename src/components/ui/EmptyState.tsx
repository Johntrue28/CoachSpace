// What a list shows when it has nothing in it, and short loading placeholders.

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
      className={`grid justify-items-center gap-1.5 rounded-control border border-dashed border-line-strong px-4 py-6 text-center ${className}`}
    >
      {icon && <div className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink-muted">{icon}</div>}
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
      Loading…
    </p>
  );
}
