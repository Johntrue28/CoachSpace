import Link from "next/link";
import { LogoMark } from "@/components/Icons";
import { t } from "@/i18n";

/** CoachSpace logo (placeholder mark from the Figma design); links to the view's home page. */
export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-control" aria-label={t("nav.logoHome")}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand text-on-brand shadow-brand">
        <LogoMark className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink lg:text-xl">
        Coach<span className="text-brand-strong lg:text-brand">Space</span>
      </span>
    </Link>
  );
}
