import type { Announcement } from "@/data/types";
import { announcementAudience, senderName } from "@/data/messages";
import { MegaphoneIcon } from "@/components/Icons";
import { formatPosted } from "@/components/format";

/** One announcement. Announcements look different from chat messages on purpose. */
export default function AnnouncementCard({ announcement: a, showAudience = true }: { announcement: Announcement; showAudience?: boolean }) {
  return (
    <article className="flex gap-3">
      <MegaphoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div className="min-w-0">
        <h3 className="font-semibold">{a.title}</h3>
        <p className="whitespace-pre-line break-words text-sm text-ink-soft">{a.body}</p>
        <p className="mt-1 text-xs text-ink-soft">
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
      </div>
    </article>
  );
}
