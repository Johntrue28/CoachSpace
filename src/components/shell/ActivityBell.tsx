"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BellIcon, CalendarIcon, ChatIcon, UserCheckIcon } from "@/components/Icons";
import { relativeDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";
import { useChatStore } from "@/data/chat-store";
import { useDemoStore } from "@/data/store";
import { buildActivity, type ActivityItem, type SessionChange } from "@/data/activity";
import { toDateKey } from "@/data/calendar";
import { DEMO_PARTICIPANT_ID, groupIdsOf, groupName } from "@/data/groups";
import { COACH_SENDER_ID, conversationById, conversationTitle, conversationsFor } from "@/data/messages";

const changeTitle: Record<SessionChange, string> = {
  cancelled: "Session cancelled",
  added: "One-off session added",
  moved: "Session moved",
  place: "Place changed",
  updated: "Session details changed",
};

/**
 * The bell in the header: "Activity in this demo" (D-040). Lists unread conversations, recent
 * sessions without attendance (coach only) and upcoming changed sessions, worked out from the demo
 * data in this browser. It never claims to be a real-time or push notification.
 */
export default function ActivityBell({ participant }: { participant: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const now = useNow();
  const { unreadIn } = useChatStore();
  const { schedule, attendance, ready, features } = useDemoStore();
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const viewerId = participant ? DEMO_PARTICIPANT_ID : COACH_SENDER_ID;
  const base = participant ? "/me" : "";

  const items = useMemo(() => {
    if (!now || !ready) return [];
    return buildActivity({
      now,
      unread: conversationsFor(viewerId).map((c) => ({ conversationId: c.id, count: unreadIn(c.id, viewerId) })),
      changes: schedule,
      attendance,
      groupIds: participant ? groupIdsOf(DEMO_PARTICIPANT_ID) : undefined,
      includeAttendance: !participant && features.attendanceEnabled,
    });
  }, [now, ready, viewerId, unreadIn, schedule, attendance, participant, features.attendanceEnabled]);

  // Close on navigation, Escape and clicks outside.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const todayKey = now ? toDateKey(now) : "";

  function describe(item: ActivityItem) {
    switch (item.kind) {
      case "unread": {
        const c = conversationById(item.conversationId);
        return {
          key: `u-${item.conversationId}`,
          href: `${base}/chat/${item.conversationId}`,
          Icon: ChatIcon,
          tone: "bg-brand-soft text-brand-strong",
          title: "New messages",
          detail: `${c ? conversationTitle(c, viewerId) : "Chat"} · ${item.count} unread`,
        };
      }
      case "attendance": {
        const n = item.sessionIds.length;
        return {
          key: `a-${item.groupId}`,
          href: `/attendance?group=${item.groupId}`,
          Icon: UserCheckIcon,
          tone: "bg-attention-soft text-attention-ink",
          title: "Attendance not taken",
          detail: `${groupName(item.groupId)} · ${n} recent session${n === 1 ? "" : "s"}`,
        };
      }
      case "session":
        return {
          key: `s-${item.session.id}`,
          href: `${base}/calendar/${item.session.id}`,
          Icon: CalendarIcon,
          tone: item.change === "cancelled" ? "bg-danger-soft text-danger" : "bg-info-soft text-info",
          title: changeTitle[item.change],
          detail: `${groupName(item.session.groupId)} · ${relativeDayLabel(item.session.date, todayKey)}, ${item.session.time}`,
        };
    }
  }

  const count = items.length;
  return (
    <div ref={wrapper} className="sm:relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={count > 0 ? `Activity in this demo, ${count} item${count === 1 ? "" : "s"}` : "Activity in this demo"}
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-control border border-line bg-card text-ink-soft transition hover:bg-surface hover:text-ink"
      >
        <BellIcon className="h-5 w-5" />
        {count > 0 && <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-attention ring-2 ring-card" />}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Activity in this demo"
          className="fixed inset-x-4 top-[4.5rem] z-50 rounded-card bg-card p-3 shadow-raised ring-1 ring-line sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[23rem]"
        >
          <p className="px-2 pt-1 text-sm font-bold text-ink">Activity in this demo</p>
          {count === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-ink-soft">Nothing needs your attention.</p>
          ) : (
            <ul className="mt-2 max-h-[min(24rem,60dvh)] space-y-0.5 overflow-y-auto">
              {items.map((item) => {
                const d = describe(item);
                return (
                  <li key={d.key}>
                    <Link href={d.href} className="flex gap-3 rounded-control p-2.5 hover:bg-surface">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-control ${d.tone}`}>
                        <d.Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{d.title}</span>
                        <span className="block truncate text-xs text-ink-soft">{d.detail}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-2 border-t border-line px-2 pt-2 text-xs text-ink-soft">
            Worked out from the demo data in this browser. Not real-time or push notifications.
          </p>
        </div>
      )}
    </div>
  );
}
