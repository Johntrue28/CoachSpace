import type { Announcement } from "@/data/types";
import { announcementAudience, senderName } from "@/data/messages";
import { MegaphoneIcon } from "@/components/Icons";
import { formatPosted } from "@/components/format";

/**
 * One announcement (Figma Announcements): icon tile, title, author, audience and time, then the
 * text. Announcements look different from chat messages on purpose.
 */
export default function AnnouncementCard({ announcement: a, showAudience = true }: { announcement: Announcement; showAudience?: boolean }) {
  return (
    <article className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-attention-soft text-attention" aria-hidden>
        <MegaphoneIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h3 className="font-bold text-ink">{a.title}</h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          {senderName(a.authorId)}
          {showAudience && (
            <>
              {" · "}
              <span className={a.groupId ? "" : "font-semibold text-brand-strong"}>{announcementAudience(a)}</span>
            </>
          )}
          {" · "}
          {/* Formatted in the viewer's time zone, so the server text can differ. */}
          <time dateTime={a.postedAt} suppressHydrationWarning>
            {formatPosted(a.postedAt)}
          </time>
        </p>
        <p className="mt-2 whitespace-pre-line break-words text-sm text-ink-soft">{a.body}</p>
      </div>
    </article>
  );
}
