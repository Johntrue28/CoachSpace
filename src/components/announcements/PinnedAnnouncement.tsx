"use client";

import Link from "next/link";
import { useDemoStore } from "@/data/store";
import { groupName } from "@/data/groups";
import { firstLine, pinnedAnnouncement, type PinViewer } from "@/data/pinned";
import { formatPosted } from "@/components/format";
import { CloseIcon, MegaphoneIcon } from "@/components/Icons";
import { t } from "@/i18n";

/**
 * The latest announcement pinned at the top of Home (D-076): title, first line, group and date. The whole card
 * opens it in Messages → Announcements; the × hides it in this browser until a newer one is posted.
 */
export default function PinnedAnnouncement({ viewer, groupIds }: { viewer: PinViewer; groupIds?: string[] }) {
  const { announcements, hiddenPins, hidePin, ready } = useDemoStore();
  if (!ready) return null;
  const a = pinnedAnnouncement(announcements, hiddenPins[viewer], groupIds);
  if (!a) return null;
  const href = `${viewer === "coach" ? "/announcements" : "/me/announcements"}#an-${a.id}`;
  return (
    <section aria-label={t("pinned.label")} className="relative rounded-card bg-card shadow-card ring-1 ring-line transition hover:ring-brand/40">
      <Link href={href} className="press flex gap-3 rounded-card p-4 pr-12">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-lime text-on-lime" aria-hidden="true">
          <MegaphoneIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-ink-soft">
            {a.groupId ? groupName(a.groupId) : t("common.allGroups")} · {formatPosted(a.postedAt)}
          </span>
          <span className="mt-0.5 block font-bold text-ink">{a.title}</span>
          <span className="mt-0.5 block truncate text-sm text-ink-soft">{firstLine(a.body)}</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => hidePin(viewer, a.id)}
        aria-label={t("pinned.hide")}
        className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-control text-ink-soft transition hover:bg-surface hover:text-ink"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </section>
  );
}
