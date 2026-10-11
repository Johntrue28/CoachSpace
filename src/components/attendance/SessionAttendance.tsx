"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { attendanceSummary } from "@/data/calendar";
import { buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";
import { cardClass } from "@/components/ui/Card";

/** Attendance block on a session's detail page. */
export default function SessionAttendance({ sessionId, groupId }: { sessionId: string; groupId: string }) {
  const { attendance, ready } = useDemoStore();
  const record = attendance.find((r) => r.sessionId === sessionId);
  const href = `/calendar/${sessionId}/attendance?group=${groupId}`;

  return (
    <section className={cardClass({ className: "mt-4" })}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">Attendance</h2>
        {record && (
          <Link href={href} className="text-sm font-semibold text-brand-strong">
            Edit
          </Link>
        )}
      </div>

      {!ready ? (
        <Loading className="mt-2" />
      ) : record ? (
        <Summary {...attendanceSummary(record)} />
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">Not taken yet.</p>
          <Link
            href={href}
            className={buttonClass({ block: true, className: "mt-3" })}
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
      <span className="font-semibold text-brand-strong">{present} present</span>
      {" · "}
      <span className="font-semibold text-danger">{absent} absent</span>
      <span className="text-ink-soft"> · {total} participants</span>
    </p>
  );
}
