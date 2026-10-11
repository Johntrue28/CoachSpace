import Link from "next/link";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <main className="px-4 pt-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-line bg-card p-6 text-center">
        <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-[#8a5a10]">
          Coming soon
        </span>
        <p className="mt-3 text-sm text-ink-soft">{description}</p>
        <Link href="/" className="mt-5 inline-block text-sm font-semibold text-brand">
          Back to home
        </Link>
      </div>
    </main>
  );
}
