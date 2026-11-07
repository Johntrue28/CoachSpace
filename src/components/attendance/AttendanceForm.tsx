"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRsvp } from "@/data/use-rsvp";
import { registerDefaults } from "@/data/rsvp";
import { useAttendanceSetting, useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { groupName } from "@/data/groups";
import { rosterFor, sessionMatchesGroup } from "@/data/attendance";
import type { AttendanceMark } from "@/data/types";
import Avatar from "@/components/Avatar";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/Icons";

import { formatDateKey } from "@/components/format";
import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Loading } from "@/components/ui/EmptyState";
import AttendanceOff from "./AttendanceOff";

/**
 * Takes attendance for one session (D-056): everyone starts as present on a new record and the
 * coach taps only the absentees; a saved record starts from its saved marks. `groupId` is the group the coach started from (when known):
 * the session must belong to it, and only that group's members are listed.
 */
export default function AttendanceForm({ sessionId, groupId }: { sessionId: string; groupId?: string }) {
  const nav = useNavigation();
  const { attendance, ready, saveAttendance } = useDemoStore();
  const attendanceSetting = useAttendanceSetting();
  const session = useSessions().byId(sessionId);
  // Only the participants of this session's group can be marked.
  const members = session ? rosterFor(session.groupId) : [];
  const rsvp = useRsvp();
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // When attendance was already taken, start from the saved marks so they can be corrected.
  useEffect(() => {
    if (!ready || !rsvp.ready || loaded) return;
    const saved = attendance.find((r) => r.sessionId === sessionId);
    if (saved) setMarks(saved.marks);
    // A new register starts from the answers (D-071): members who said they are not going start absent.
    else if (session) setMarks(registerDefaults(rsvp.answers(session), session.groupId));
    setLoaded(true);
  }, [ready, loaded, attendance, sessionId, rsvp, session]);

  // Attendance switched off (D-042): no active form, even when the page is opened directly.
  if (ready && !attendanceSetting.enabled) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <BackLink fallback={session ? `/calendar/${session.id}` : "/calendar"} fallbackLabel={session ? "Session" : "Calendar"} />
        <h1 className="mt-4 text-2xl font-bold">Attendance</h1>
        <AttendanceOff
          backHref={session ? `/calendar/${session.id}` : "/calendar"}
          backLabel={session ? "Back to the session" : "Open the calendar"}
        />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <p className="text-sm text-ink-soft">{ready ? "This session was not found." : "Loading…"}</p>
      </main>
    );
  }

  if (!sessionMatchesGroup(session, groupId)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <BackLink fallback={`/attendance?group=${groupId}`} fallbackLabel="Take attendance" />
        <p role="alert" className="mt-6 text-sm text-danger">
          This session belongs to {groupName(session.groupId)}, not {groupName(groupId ?? "") || "the selected group"}.
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm font-semibold text-brand-strong">
          <Link href={`/attendance?group=${groupId}`}>Choose a {groupName(groupId ?? "") || "group"} session</Link>
          <Link href={`/calendar/${session.id}/attendance?group=${session.groupId}`}>Take attendance for {groupName(session.groupId)}</Link>
        </div>
      </main>
    );
  }

  if (session.status === "cancelled") {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <BackLink fallback={`/calendar/${session.id}`} fallbackLabel="Session" />
        <p className="mt-6 text-sm text-ink-soft">This session is cancelled, so there is no attendance to take.</p>
      </main>
    );
  }

  const present = members.filter((p) => marks[p.id] !== "absent").length;
  const absent = members.length - present;
  const sessionHref = `/calendar/${session.id}`;
  const isNew = !attendance.some((r) => r.sessionId === session.id);

  function toggle(participantId: string, isPresent: boolean) {
    setMarks((prev) => ({ ...prev, [participantId]: isPresent ? "present" : "absent" }));
  }

  function markAllPresent() {
    setMarks(Object.fromEntries(members.map((p) => [p.id, "present" as const])));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!session || saving) return;
    setSaving(true);
    // Everyone starts as present (D-056): a participant without a mark is present.
    const clean = Object.fromEntries(members.map((p) => [p.id, marks[p.id] === "absent" ? "absent" : "present"] as const));
    saveAttendance({ sessionId: session.id, groupId: session.groupId, marks: clean });
    nav.returnTo(sessionHref, "Attendance saved on this device.");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <BackLink fallback={sessionHref} fallbackLabel="Session" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Attendance</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        {session.title} · {groupName(session.groupId)} · {formatDateKey(session.date)}, {session.time}
      </p>

      {!ready || !loaded ? (
        <Loading block />
      ) : members.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">This group has no participants yet.</p>
      ) : (
        <form onSubmit={save} className="mt-4">
          <div className="overflow-hidden rounded-card bg-card shadow-card ring-1 ring-line">
            <div className="border-b border-line p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-ink">{groupName(session.groupId)}</p>
                <p className="text-xs text-ink-soft">{members.length} participants</p>
              </div>
              <p className="mt-1 text-sm text-ink">
                {isNew ? "Members who said they can't come start as absent; everyone else as present. Tap to change." : "Attendance already saved. Tap anyone to change it."}
              </p>
              <button
                type="button"
                onClick={markAllPresent}
                disabled={absent === 0}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-brand-soft px-4 text-sm font-semibold text-brand-strong ring-1 ring-inset ring-brand/30 transition hover:bg-brand-soft/70 disabled:opacity-60"
              >
                <CheckIcon className="h-4 w-4" />
                {absent === 0 ? "Everyone is marked present" : "Mark everyone present"}
              </button>
            </div>

            <ul className="divide-y divide-line">
              {members.map((p) => {
                const isPresent = marks[p.id] !== "absent";
                return (
                  <li key={p.id}>
                    <label
                      className={`flex min-h-14 cursor-pointer items-center gap-3 px-4 py-2 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-brand ${
                        isPresent ? "hover:bg-surface" : "bg-danger-soft/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isPresent}
                        onChange={(e) => toggle(p.id, e.target.checked)}
                        aria-label={`${p.name} present`}
                      />
                      <Avatar name={p.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-ink">{p.name}</span>
                        <span className="block truncate text-xs text-ink-soft">{p.detail}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`inline-flex min-h-11 w-[6.5rem] shrink-0 items-center justify-center gap-1.5 rounded-control text-sm font-semibold transition ${
                          isPresent ? "bg-brand-strong text-on-brand" : "bg-danger text-on-brand"
                        }`}
                      >
                        {isPresent ? <CheckIcon className="h-4 w-4" /> : <CrossIcon />}
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line bg-surface p-4">
              <DeviceOnlyNotice>saved on this device only. Participants do not see it and it is not synced.</DeviceOnlyNotice>
            </div>
          </div>

          {/* Counts and Save stay within reach, above the bottom navigation on phones. */}
          <div className="sticky bottom-[calc(var(--bottom-nav-h)+0.5rem)] z-10 mt-3 flex items-center gap-3 rounded-card bg-card p-3 shadow-raised ring-1 ring-line lg:bottom-4">
            <p role="status" aria-live="polite" className="min-w-0 flex-1 text-sm text-ink">
              <span className="font-bold text-brand-strong">{present} present</span>
              <span className="text-ink-soft"> · </span>
              <span className={absent ? "font-bold text-danger" : "text-ink-soft"}>{absent} absent</span>
            </p>
            <Button type="submit" size="lg" disabled={saving} className="shrink-0 px-6">
              {saving ? "Saving…" : "Save attendance"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
