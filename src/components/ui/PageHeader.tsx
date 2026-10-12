/** The title block at the top of a section page (Figma "PageHeader"): title, a short line and an optional action. */
export default function PageHeader({
  title,
  description,
  action,
  className = "",
  titleAs: Title = "h1",
}: {
  title: string;
  /** "p" when another heading on the page is the h1 (for example an open conversation). */
  titleAs?: "h1" | "p";
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        <Title className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</Title>
        {description && <p className="mt-1.5 text-sm text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
