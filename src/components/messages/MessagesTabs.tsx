import Link from "next/link";

/**
 * Messages = chats + announcements (D-071): one place to communicate, with a two-way switch at the
 * top of both pages. The routes stay the same (/chat, /announcements and their /me versions).
 */
export default function MessagesTabs({ active, participant = false, className = "" }: { active: "chats" | "announcements"; participant?: boolean; className?: string }) {
  const base = participant ? "/me" : "";
  const tabs = [
    { key: "chats", label: "Chats", href: `${base}/chat` },
    { key: "announcements", label: "Announcements", href: `${base}/announcements` },
  ] as const;
  return (
    <nav aria-label="Messages" className={`inline-flex rounded-control bg-sunken p-1 ${className}`}>
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={`min-h-9 rounded-[0.6rem] px-4 py-2 text-sm font-semibold transition ${
            active === t.key ? "bg-card text-ink shadow-card" : "text-ink-soft hover:text-ink"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
