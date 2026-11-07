import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import { cardClass } from "@/components/ui/Card";
import { t } from "@/i18n";

/** A titled card used to group content on overview pages (homes, group pages), as in the Figma design. */
export default function SectionCard({
  title,
  href,
  linkLabel = t("player.seeAll"),
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
  // Names the region after its heading, so screen readers announce "My groups", "Calendar"…
  const headingId = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={headingId} className={cardClass({ className: `sm:p-5 ${className}` })}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-base font-bold text-ink">
          {title}
        </h2>
        {action ??
          (href && (
            <Link href={href} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-strong hover:underline">
              {linkLabel}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          ))}
      </div>
      {children}
    </section>
  );
}
