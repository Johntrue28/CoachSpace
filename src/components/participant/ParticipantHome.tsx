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
import RecentAnnouncements from "@/components/announcements/RecentAnnouncements";
import UnreadSummary from "@/components/chat/UnreadSummary";
import MyVideosPreview from "@/components/participant/MyVideosPreview";
import RsvpButtons from "@/components/rsvp/RsvpButtons";
import SwipeDeck from "@/components/participant/SwipeDeck";
import MySeason from "@/components/participant/MySeason";

/**
 * The player's home (D-071): their next sessions, each with the one-tap "Are you coming?" answer,
 * as in the team apps they know. Then messages, their exercises and announcements. The participant's
 * groups only. Answers are saved in this browser and show up at once in the coach's view.
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6 lg:pt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">{myGroupIds.map((id) => groupById(id)?.name).join(" · ")}</p>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Hi {me.name.split(" ")[0]}</h1>
      {unanswered > 0 && (
        <p className="mt-1 text-sm text-ink">
          <span className="font-semibold">{unanswered} session{unanswered === 1 ? "" : "s"}</span> waiting for your answer.
        </p>
      )}

      {now && ready && (
        <div className="mt-4">
          <SwipeDeck sessions={sessions} now={now} rsvp={rsvp} participantId={me.id} />
        </div>
      )}

      <div className="mt-6">
        <MySeason participantId={me.id} />
      </div>

      <section aria-labelledby="my-agenda" className="mt-6">
        <h2 id="my-agenda" className="px-1 pb-2 text-base font-bold text-ink">
          My next sessions
        </h2>
        {!now || !ready ? (
          <p className="text-sm text-ink-soft">Loading your sessions…</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => {
              const cancelled = s.status === "cancelled";
              return (
                <li key={s.id} className="rounded-card bg-card p-4 shadow-card ring-1 ring-line">
                  <Link href={`/me/calendar/${s.id}`} className="flex items-start gap-3">
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
                    <div className="mt-3">
                      <RsvpButtons session={s} participantId={me.id} size="sm" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3 flex justify-center">
          <Link href="/me/calendar" className="rounded-control px-3 py-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft">
            Open my calendar
          </Link>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        <UnreadSummary viewerId={me.id} basePath="/me/chat" />
        <SectionCard title="My exercises" href="/me/videos" linkLabel="See all" className="">
          <MyVideosPreview />
        </SectionCard>
        <SectionCard title="Announcements" href="/me/announcements" className="">
          <RecentAnnouncements groupIds={myGroupIds} limit={2} canPost={false} />
        </SectionCard>
      </div>

      <p className="pt-8 text-center text-xs text-ink-soft">Demo with fictional data. Your answers stay in this browser.</p>
    </main>
  );
}
