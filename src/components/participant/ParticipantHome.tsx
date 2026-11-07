"use client";

import Link from "next/link";
import { sessionStart, toDateKey } from "@/data/calendar";
import { DEMO_PARTICIPANT_ID, groupById, groupIdsOf, participantById } from "@/data/groups";
import { useSessions } from "@/data/use-sessions";
import { useRsvp } from "@/data/use-rsvp";
import { useNow } from "@/components/useNow";
import { shortDayLabel } from "@/components/format";
import { ChevronRightIcon } from "@/components/Icons";
import SectionCard from "@/components/SectionCard";
import SessionBadges from "@/components/calendar/SessionBadges";
import PinnedAnnouncement from "@/components/announcements/PinnedAnnouncement";
import UnreadSummary from "@/components/chat/UnreadSummary";
import MyVideosPreview from "@/components/participant/MyVideosPreview";
import RsvpButtons from "@/components/rsvp/RsvpButtons";
import { useDemoStore } from "@/data/store";
import { seasonOf } from "@/data/season";
import { t, tn } from "@/i18n";

/**
 * The player's Home (D-071, D-076): their attendance, the latest announcement, their next sessions with the
 * one-tap "Are you coming?" answer, then unread messages and their first exercises. The participant's groups
 * only. Answers are saved in this browser and show up at once in the coach's view.
 */
export default function ParticipantHome() {
  const me = participantById(DEMO_PARTICIPANT_ID)!;
  const myGroupIds = groupIdsOf(me.id);
  const now = useNow();
  const { ready, upcoming } = useSessions();
  const rsvp = useRsvp();
  const sessions = now && ready ? upcoming(now, { limit: 6, groupIds: myGroupIds }) : [];
  const unanswered = rsvp.ready ? sessions.filter((s) => s.status !== "cancelled" && !rsvp.answerOf(s, me.id)).length : 0;
  const today = now ? toDateKey(now) : "";
  const store = useDemoStore();
  const season = seasonOf(me.id, store.attendance);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6 lg:pt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">{myGroupIds.map((id) => groupById(id)?.name).join(" · ")}</p>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t("player.hi", { name: me.name.split(" ")[0] })}</h1>
      {unanswered > 0 && (
        <p className="mt-1 text-sm text-ink">
          {tn("player.waiting", unanswered)}
        </p>
      )}

      {store.ready && season.rate !== null && (
        <p className="mt-1 text-sm text-ink">
          {t("player.attendance")} <span className="font-semibold">{season.rate}%</span>
        </p>
      )}

      <div className="mt-4">
        <PinnedAnnouncement viewer="player" groupIds={myGroupIds} />
      </div>

      <section aria-labelledby="my-agenda" className="mt-6">
        <h2 id="my-agenda" className="px-1 pb-2 text-base font-bold text-ink">
          {t("player.nextSessions")}
        </h2>
        {!now || !ready ? (
          <p className="text-sm text-ink-soft">{t("player.loadingSessions")}</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => {
              const cancelled = s.status === "cancelled";
              return (
                <li key={s.id} className="relative rounded-card bg-card p-4 shadow-card ring-1 ring-line transition hover:ring-brand/40">
                  {/* The whole row (outside the answer buttons) opens the session (D-076). */}
                  <Link href={`/me/calendar/${s.id}`} className="flex items-start gap-3 after:absolute after:inset-0 after:rounded-card after:content-['']">
                    <div className="w-14 shrink-0">
                      <p className="text-xs font-semibold text-brand-strong">{shortDayLabel(s.date, today)}</p>
                      <p className="text-lg font-bold tabular-nums text-ink">{s.time}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${cancelled ? "text-ink-soft line-through" : "text-ink"}`}>{s.title}</p>
                      <p className="truncate text-sm text-ink-soft">
                        {groupById(s.groupId)?.name} · {s.place}
                      </p>
                      <div className="mt-1">
                        <SessionBadges session={s} compact />
                      </div>
                    </div>
                    <ChevronRightIcon className="mt-1 h-5 w-5 shrink-0 text-ink-muted" />
                  </Link>
                  {!cancelled && sessionStart(s) > now && (
                    <div className="relative z-10 mt-3">
                      <RsvpButtons session={s} participantId={me.id} size="sm" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-6 space-y-6">
        <UnreadSummary viewerId={me.id} basePath="/me/chat" />
        <SectionCard title={t("player.myExercises")} href="/me/videos" linkLabel={t("player.seeAll")} className="">
          <MyVideosPreview />
        </SectionCard>
      </div>

      <p className="pt-8 text-center text-xs text-ink-soft">{t("player.demoLine")}</p>
    </main>
  );
}
