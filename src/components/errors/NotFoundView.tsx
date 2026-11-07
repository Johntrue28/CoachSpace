"use client";

import Link from "next/link";
import { WELCOME_PATH } from "@/data/persistence";
import { t } from "@/i18n";

/** A link that leads nowhere (a mistyped address, an old link): back into the demo (D-069), in the interface language. */
export default function NotFoundView() {
  return (
    <main className="mx-auto grid min-h-[60dvh] w-full max-w-lg place-content-center gap-3 px-4 py-10 text-center">
      <h1 className="text-2xl font-bold text-ink">{t("errors.notFoundTitle")}</h1>
      <p className="text-sm text-ink-soft">{t("errors.notFoundBody")}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-control bg-brand-strong px-4 text-sm font-semibold text-on-brand">
          {t("errors.home")}
        </Link>
        <Link href={WELCOME_PATH} className="inline-flex min-h-11 items-center justify-center rounded-control bg-card px-4 text-sm font-semibold text-ink ring-1 ring-line">
          {t("errors.chooseSport")}
        </Link>
      </div>
    </main>
  );
}
