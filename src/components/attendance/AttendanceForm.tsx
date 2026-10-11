"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { groupName, participantsOf } from "@/data/groups";
import type { AttendanceMark } from "@/data/types";
import Avatar from "@/components/Avatar";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { PrimaryButton } from "@/components/Form";
import { ArrowLeftIcon } from "@/components/Icons";
import { formatDateKey } from "@/components/format";

const markStyles: Record<AttendanceMark, string> = {
  present: "bg-brand text-white ring-brand",
  absent: "bg-red-700 text-white ring-red-700",
};

export default function AttendanceForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { attendance, ready, saveAttendance } = useDemoStore();
  const session = useSessions().byId(sessionId);
  // Only the participants of this session's group can be marked.
  const members = session ? participantsOf(session.groupId) : [];
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});
  const [loaded, setLoaded] = useState(false);

  // When attendance was already taken, start from the saved marks so they can be corrected.
  useEffect(() => {
    if (!ready || loaded) return;
    const saved = attendance.find((r) => r.sessionId === sessionId);
    if (saved) setMarks(saved.marks);
    setLoaded(true);
  }, [ready, loaded, attendance, sessionId]);

  if (!session) {
    return (
      <main className="px-4 pt-8">
        <p className="text-sm text-ink-soft">{ready ? "This session was not found." : "Loading…"}</p>
      </main>
    );
  }

  if (session.status === "cancelled") {
    return (
      <main className="px-4 pt-6">
        <Link href={`/calendar/${session.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
          <ArrowLeftIcon className="h-4 w-4" /> Session
        </Link>
        <p className="mt-6 text-sm text-ink-soft">This session is cancelled, so there is no attendance to take.</p>
      </main>
    );
  }

  const present = members.filter((p) => marks[p.id] === "present").length;
  const absent = members.filter((p) => marks[p.id] === "absent").length;
  const unmarked = members.length - present - absent;
  const sessionHref = `/calendar/${session.id}`;

  function mark(participantId: string, value: AttendanceMark) {
    setMarks((prev) => ({ ...prev, [participantId]: value }));
  }

  function markAllPresent() {
    setMarks(Object.fromEntries(members.map((p) => [p.id, "present" as const])));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!session || unmarked > 0) return;
    // Keep only marks for this group's participants.
    const clean = Object.fromEntries(members.map((p) => [p.id, marks[p.id]]));
    saveAttendance({ sessionId: session.id, groupId: session.groupId, marks: clean });
    router.push(`${sessionHref}?saved=attendance`);
  }

  return (
    <main className="px-4 pt-6">
      <Link href={sessionHref} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
        <ArrowLeftIcon className="h-4 w-4" /> Session
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Attendance</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {session.title} · {groupName(session.groupId)} · {formatDateKey(session.date)}, {session.time}
      </p>

      <div className="sticky top-0 z-10 -mx-4 mt-4 bg-surface/95 px-4 py-2 backdrop-blur">
        <div role="status" aria-live="polite" className="grid grid-cols-3 gap-2 text-center">
          <Count value={present} label="Present" className="text-brand" />
          <Count value={absent} label="Absent" className="text-red-700" />
          <Count value={unmarked} label="Not marked" className="text-ink-soft" />
        </div>
      </div>

      {!ready ? (
        <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>
      ) : members.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">This group has no participants yet.</p>
      ) : (
        <form onSubmit={save}>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={markAllPresent} className="text-sm font-semibold text-brand">
              Mark everyone present
            </button>
          </div>

          <ul className="mt-2 divide-y divide-line rounded-2xl bg-card px-3 ring-1 ring-line">
            {members.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <Avatar name={p.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-ink-soft">{p.detail}</p>
                </div>
                <div role="group" aria-label={`Attendance for ${p.name}`} className="flex shrink-0 gap-1.5">
                  {(["present", "absent"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => mark(p.id, value)}
                      aria-pressed={marks[p.id] === value}
                      className={`min-w-[4.5rem] rounded-full px-3 py-2 text-sm font-semibold ring-1 ${
                        marks[p.id] === value ? markStyles[value] : "bg-card text-ink ring-line"
                      }`}
                    >
                      {value === "present" ? "Present" : "Absent"}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-3">
            <PrimaryButton type="submit" disabled={unmarked > 0}>
              Save attendance
            </PrimaryButton>
            {unmarked > 0 && (
              <p className="text-center text-xs text-ink-soft">
                Mark everyone to save ({unmarked} left). You can change any mark before saving.
              </p>
            )}
            <DeviceOnlyNotice>
              attendance is saved on this device only. It is not shared with participants or synced anywhere.
            </DeviceOnlyNotice>
          </div>
        </form>
      )}
    </main>
  );
}

function Count({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div className="rounded-xl bg-card py-2 ring-1 ring-line">
      <p className={`text-xl font-bold ${className}`}>{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}
