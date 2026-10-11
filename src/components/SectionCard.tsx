import Link from "next/link";

/** A titled card used to group content on overview pages (homes, group pages). */
export default function SectionCard({
  title,
  href,
  linkLabel = "See all",
  action,
  className = "mt-4",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  /** Custom action at the top right, instead of the "See all" link. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${className} rounded-2xl bg-card p-4 ring-1 ring-line`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-bold">{title}</h2>
        {action ??
          (href && (
            <Link href={href} className="text-sm font-semibold text-brand">
              {linkLabel}
            </Link>
          ))}
      </div>
      {children}
    </section>
  );
}
