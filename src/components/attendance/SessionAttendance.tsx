"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { attendanceSummary } from "@/data/calendar";

/** Attendance block on a session's detail page. */
export default function SessionAttendance({ sessionId }: { sessionId: string }) {
  const { attendance, ready } = useDemoStore();
  const record = attendance.find((r) => r.sessionId === sessionId);
  const href = `/calendar/${sessionId}/attendance`;

  return (
    <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">Attendance</h2>
        {record && (
          <Link href={href} className="text-sm font-semibold text-brand">
            Edit
          </Link>
        )}
      </div>

      {!ready ? (
        <p className="mt-2 text-sm text-ink-soft">Loading…</p>
      ) : record ? (
        <Summary {...attendanceSummary(record)} />
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">Not taken yet.</p>
          <Link
            href={href}
            className="mt-3 block rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Take attendance
          </Link>
        </>
      )}
    </section>
  );
}

function Summary({ present, absent, total }: { present: number; absent: number; total: number }) {
  return (
    <p className="mt-1 text-sm">
      <span className="font-semibold text-brand">{present} present</span>
      {" · "}
      <span className="font-semibold text-red-700">{absent} absent</span>
      <span className="text-ink-soft"> · {total} participants</span>
    </p>
  );
}
