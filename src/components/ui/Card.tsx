// A separate block of content: white surface, thin border, subtle shadow.
// Use cardClass() when the card itself must be a link or another element.

export function cardClass({ padded = true, interactive = false, className = "" } = {}) {
  return [
    "rounded-card bg-card shadow-card ring-1 ring-line",
    padded ? "p-4" : "",
    interactive ? "transition hover:shadow-raised hover:ring-brand/30" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Card({
  as: Tag = "div",
  padded,
  className,
  children,
  ...props
}: {
  as?: "div" | "section" | "article" | "li";
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag {...props} className={cardClass({ padded, className })}>
      {children}
    </Tag>
  );
}

/**
 * One surface holding a list of rows separated by hairlines (D-071 principle "fewer boxes"): use it on
 * a <ul> instead of a card per item. Rows bring their own padding.
 */
export function listClass(className = "") {
  return `divide-y divide-line overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line ${className}`.trim();
}

/** The padding and hover of a link that fills one row of a list surface. */
export const rowLinkClass = "flex min-h-14 items-center gap-3 px-4 py-3 transition hover:bg-surface focus-visible:bg-surface";
