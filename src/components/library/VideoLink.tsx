import { isWebUrl, videoLinkKind, videoSourceLabel } from "@/data/exercises";
import { PlayIcon, SearchIcon } from "@/components/Icons";
import { buttonClass, type ButtonSize } from "@/components/ui/Button";
import { t } from "@/i18n";

/**
 * The link of an exercise, labelled for what it really is (D-057): "Watch on YouTube" only for a
 * specific video; a YouTube search for example videos says it opens a search; anything else is a
 * plain link. Every link opens in a new tab.
 */
export default function VideoLink({
  url,
  audience,
  size = "sm",
  primary = false,
  className = "",
}: {
  url: string;
  /** Who reads the note under a search link. */
  audience: "coach" | "participant";
  size?: ButtonSize;
  /** Show a specific video as the page's main action. */
  primary?: boolean;
  className?: string;
}) {
  // Anything that is not a web address is shown as text, never as a link.
  if (!isWebUrl(url)) return <p className={`text-xs text-ink-soft ${className}`}>{t("video.none")}</p>;
  const kind = videoLinkKind(url);
  const anchor = (content: React.ReactNode, main: boolean, extra = "") => (
    <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: main ? "primary" : "secondary", size, className: extra })}>
      {content}
    </a>
  );

  if (kind === "video") {
    return anchor(
      <>
        <PlayIcon className={`h-4 w-4 ${primary ? "" : "text-planning"}`} /> {t("video.watch", { source: videoSourceLabel(url) })}
      </>,
      primary,
      className,
    );
  }
  if (kind === "other") return anchor(t("video.open"), false, className);
  return (
    <div className={className}>
      {anchor(
        <>
          <SearchIcon className="h-4 w-4 text-planning" /> {t("video.search")}
        </>,
        false,
      )}
      <p className="mt-1.5 text-xs text-ink-soft">
        {audience === "coach"
          ? t("video.coachNone")
          : t("video.playerNone")}
      </p>
    </div>
  );
}
