"use client";

import { useState } from "react";
import type { Participant } from "@/data/types";
import Avatar from "./Avatar";
import { SearchIcon } from "./Icons";

export default function ParticipantList({ participants }: { participants: Participant[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q
    ? participants.filter((p) => p.name.toLowerCase().includes(q) || p.detail.toLowerCase().includes(q))
    : participants;

  if (participants.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-soft">No members yet. Add them here or share the invite link.</p>;
  }

  return (
    <div>
      <label className="flex min-h-10 items-center gap-2 rounded-control bg-card px-3 py-2 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
        <SearchIcon className="h-4 w-4 text-ink-soft" />
        <span className="sr-only">Search participants</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or position"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
        />
      </label>

      {shown.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">No participants match “{query}”.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {shown.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <Avatar name={p.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                <p className="truncate text-xs text-ink-soft">{p.detail}</p>
                {p.guardian && <p className="truncate text-xs text-ink-soft">Guardian: {p.guardian}</p>}
              </div>
              <span className="shrink-0 text-xs text-ink-soft">Since {p.joined}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
