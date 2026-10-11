"use client";

import Link from "next/link";
import { useUnreadTotal } from "./UnreadBadge";

/** Dashboard tile with the coach's unread messages across all chats. */
export default function UnreadStat() {
  const total = useUnreadTotal();
  return (
    <Link href="/chat" className="rounded-2xl bg-card p-3 text-center ring-1 ring-line hover:ring-brand">
      <p className={`text-2xl font-bold ${total > 0 ? "text-[#b8730c]" : ""}`}>{total}</p>
      <p className="text-xs text-ink-soft">Unread</p>
    </Link>
  );
}
