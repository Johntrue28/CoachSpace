import Link from "next/link";

/** Section card used on the participant pages. */
export default function Card({ title, href, linkLabel = "See all", children }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-bold">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-brand">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
