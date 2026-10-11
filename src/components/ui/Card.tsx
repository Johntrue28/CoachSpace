// A separate block of content: white surface, thin border, soft shadow.
// Use cardClass() when the card itself must be a link or another element.

export function cardClass({ padded = true, interactive = false, className = "" } = {}) {
  return [
    "rounded-card bg-card shadow-card ring-1 ring-line",
    padded ? "p-4" : "",
    interactive ? "transition-colors hover:ring-brand" : "",
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
