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
