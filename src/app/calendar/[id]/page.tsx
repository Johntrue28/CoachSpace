import Link from "next/link";
import { notFound } from "next/navigation";
import { sessionById, weekStart } from "@/data/calendar";
import { coach, groupById, memberCount } from "@/data/groups";
import { formatDateKeyFull } from "@/components/format";
import Avatar from "@/components/Avatar";
import SessionAttendance from "@/components/attendance/SessionAttendance";
import { ArrowLeftIcon, CalendarIcon, ChevronRightIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/Icons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${sessionById(id)?.title ?? "Session"} · CoachSpace` };
}

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attendance?: string }>;
}) {
  const { id } = await params;
  const { attendance } = await searchParams;
  const session = sessionById(id);
  const group = session && groupById(session.groupId);
  if (!session || !group) notFound();

  return (
    <main className="px-4 pt-6">
      <Link
        href={`/calendar?week=${weekStart(session.date)}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Calendar
      </Link>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand">Training session</p>
      <h1 className="mt-1 text-2xl font-bold">{session.title}</h1>

      <section className="mt-4 space-y-3 rounded-2xl bg-card p-4 text-sm ring-1 ring-line">
        <p className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {formatDateKeyFull(session.date)}
        </p>
        <p className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {session.time}–{session.endTime}
        </p>
        <p className="flex items-center gap-2">
          <PinIcon className="h-5 w-5 shrink-0 text-ink-soft" /> {session.place}
        </p>
        <p className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 shrink-0 text-ink-soft" /> Coach: {coach.name}
        </p>
      </section>

      <Link
        href={`/groups/${group.id}`}
        className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-line hover:ring-brand"
      >
        <Avatar name={group.name} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{group.name}</p>
          <p className="text-sm text-ink-soft">
            {group.discipline} · {memberCount(group.id)} participants
          </p>
        </div>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
      </Link>

      <SessionAttendance sessionId={session.id} justSaved={attendance === "saved"} />

      <p className="mt-6 text-center text-xs text-ink-soft">
        Demo schedule with fictional sessions. Nothing is synced with an external calendar.
      </p>
    </main>
  );
}
