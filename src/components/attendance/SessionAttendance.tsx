"use client";

import Link from "next/link";
import { participantsLabel } from "@/data/groups";
import { useDemoStore } from "@/data/store";
import { attendanceSummary, sessionStart } from "@/data/calendar";
import type { Session } from "@/data/types";
import { useNow } from "@/components/useNow";
import { buttonClass } from "@/components/ui/Button";
import { Loading } from "@/components/ui/EmptyState";
import { cardClass } from "@/components/ui/Card";
import { t } from "@/i18n";

/**
 * The register of a session: one line until the session starts, then "Take the register" (pre-filled from
 * the answers, D-071) or the saved count with Edit.
 */
export default function SessionAttendance({ session }: { session: Session }) {
  const { attendance, ready } = useDemoStore();
  const now = useNow();
  const record = attendance.find((r) => r.sessionId === session.id);
  const href = `/calendar/${session.id}/attendance?group=${session.groupId}`;
  const started = now ? sessionStart(session) <= now : false;

  return (
    <section aria-labelledby="register" className={cardClass({ className: "mt-4" })}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="register" className="text-lg font-bold text-ink">
          {t("register.title")}
        </h2>
        {record && (
          <Link href={href} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-strong">
            {t("common.edit")}
          </Link>
        )}
      </div>

      {!ready || !now ? (
        <Loading className="mt-2" />
      ) : record ? (
        <Summary {...attendanceSummary(record)} />
      ) : !started ? (
        <p className="mt-1 text-sm text-ink-soft">{t("register.opensAt", { time: session.time })}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">{t("register.notTaken")}</p>
          <Link href={href} className={buttonClass({ block: true, className: "mt-3" })}>
            {t("register.take")}
          </Link>
        </>
      )}
    </section>
  );
}

function Summary({ present, absent, total }: { present: number; absent: number; total: number }) {
  return (
    <p className="mt-1 flex items-baseline gap-2">
      <span className="text-2xl font-bold tabular-nums text-ink">
        {present}/{total}
      </span>
      <span className="text-sm text-ink-soft">
        {t("register.summary", { absent, people: participantsLabel(total) })}
      </span>
    </p>
  );
}
