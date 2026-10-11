import Link from "next/link";
import { groups, memberCount } from "@/data/groups";
import { upcomingSessions } from "@/data/calendar";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon, ClockIcon } from "@/components/Icons";

export default function GroupsPage() {
  return (
    <main className="px-4 pt-8">
      <h1 className="text-2xl font-bold">Groups</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {groups.length} groups · {groups.reduce((n, g) => n + memberCount(g.id), 0)} participants
      </p>

      <ul className="mt-5 space-y-3">
        {groups.map((g) => {
          const next = upcomingSessions.find((s) => s.groupId === g.id);
          return (
            <li key={g.id}>
              <Link
                href={`/groups/${g.id}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line transition-colors hover:ring-brand"
              >
                <Avatar name={g.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{g.name}</p>
                  <p className="text-sm text-ink-soft">
                    {g.discipline} · {memberCount(g.id)} participants
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {next ? `Next: ${next.day}, ${next.time}` : g.schedule}
                  </p>
                </div>
                {g.unread > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-ink">{g.unread}</span>
                )}
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
