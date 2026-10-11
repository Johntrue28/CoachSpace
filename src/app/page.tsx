import Link from "next/link";
import { coach, groups, memberCount, uniqueParticipantCount } from "@/data/groups";
import { ChevronRightIcon } from "@/components/Icons";
import NextSessionCard from "@/components/calendar/NextSessionCard";
import SessionList from "@/components/calendar/SessionList";
import RecentAttendance from "@/components/attendance/RecentAttendance";
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import Avatar from "@/components/Avatar";

export default function Home() {
  const totalMembers = uniqueParticipantCount();
  const totalUnread = groups.reduce((n, g) => n + g.unread, 0);

  return (
    <main>
      <header className="bg-brand px-4 pb-16 pt-8 text-white">
        <p className="text-sm text-white/75">{coach.organisation}</p>
        <h1 className="mt-1 text-2xl font-bold">Hi, {coach.name.split(" ")[0]}</h1>
      </header>

      <section className="-mt-12 px-4">
        <NextSessionCard />
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3 px-4">
        <Stat value={groups.length} label="Groups" />
        <Stat value={totalMembers} label="Participants" />
        <Stat value={totalUnread} label="Unread" highlight={totalUnread > 0} />
      </section>

      <Section title="My groups" href="/groups">
        <ul className="divide-y divide-line">
          {groups.map((g) => (
            <li key={g.id}>
              <Link href={`/groups/${g.id}`} className="flex items-center gap-3 py-3">
                <Avatar name={g.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{g.name}</p>
                  <p className="text-sm text-ink-soft">
                    {g.discipline} · {memberCount(g.id)} participants
                  </p>
                </div>
                {g.unread > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-ink">{g.unread}</span>
                )}
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Upcoming sessions" href="/calendar">
        <SessionList />
      </Section>

      <Section title="Attendance">
        <RecentAttendance />
      </Section>

      <Section title="Recent announcements" href="/announcements">
        <RecentAnnouncements />
      </Section>

      <p className="px-4 pt-6 text-center text-xs text-ink-soft">Demo with fictional data</p>
    </main>
  );
}

function Stat({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center ring-1 ring-line">
      <p className={`text-2xl font-bold ${highlight ? "text-[#b8730c]" : ""}`}>{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mx-4 mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-brand">
            See all
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
