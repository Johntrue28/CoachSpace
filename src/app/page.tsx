import Link from "next/link";
import { coach, groups, groupName, memberCount, participants } from "@/data/groups";
import { upcomingSessions } from "@/data/calendar";
import { announcements } from "@/data/messages";
import { PinIcon, MegaphoneIcon, ChevronRightIcon } from "@/components/Icons";
import Avatar from "@/components/Avatar";

export default function Home() {
  const totalMembers = participants.length;
  const totalUnread = groups.reduce((n, g) => n + g.unread, 0);
  const next = upcomingSessions[0];

  return (
    <main>
      <header className="bg-brand px-4 pb-16 pt-8 text-white">
        <p className="text-sm text-white/75">{coach.organisation}</p>
        <h1 className="mt-1 text-2xl font-bold">Hi, {coach.name.split(" ")[0]}</h1>
      </header>

      <section className="-mt-12 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Next session</p>
          <p className="mt-1 text-lg font-bold">{next.title}</p>
          <p className="text-sm text-ink-soft">
            {groupName(next.groupId)} · {next.day}, {next.time}
          </p>
          <p className="mt-2 flex items-center gap-1 text-sm text-ink-soft">
            <PinIcon className="h-4 w-4" /> {next.place}
          </p>
        </div>
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

      <Section title="This week" href="/calendar">
        <ul className="space-y-3">
          {upcomingSessions.map((s) => (
            <li key={s.id} className="flex gap-3">
              <div className="w-20 shrink-0 text-sm">
                <p className="font-semibold">{s.day}</p>
                <p className="text-ink-soft">{s.time}</p>
              </div>
              <div className="min-w-0 border-l-2 border-brand pl-3">
                <p className="font-semibold">{s.title}</p>
                <p className="truncate text-sm text-ink-soft">{groupName(s.groupId)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recent announcements">
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="flex gap-3">
              <MegaphoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-ink-soft">{a.body}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {groupName(a.groupId)} · {a.date}
                </p>
              </div>
            </li>
          ))}
        </ul>
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
