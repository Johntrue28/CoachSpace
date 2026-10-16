import { isWebUrl, videoLinkKind, videoSourceLabel } from "@/data/exercises";
import { PlayIcon, SearchIcon } from "@/components/Icons";
import { buttonClass, type ButtonSize } from "@/components/ui/Button";

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
  if (!isWebUrl(url)) return <p className={`text-xs text-ink-soft ${className}`}>No video link.</p>;
  const kind = videoLinkKind(url);
  const anchor = (content: React.ReactNode, main: boolean, extra = "") => (
    <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: main ? "primary" : "secondary", size, className: extra })}>
      {content}
    </a>
  );

  if (kind === "video") {
    return anchor(
      <>
        <PlayIcon className={`h-4 w-4 ${primary ? "" : "text-planning"}`} /> Watch on {videoSourceLabel(url)} (opens in a new tab)
      </>,
      primary,
      className,
    );
  }
  if (kind === "other") return anchor("Open link (opens in a new tab)", false, className);
  return (
    <div className={className}>
      {anchor(
        <>
          <SearchIcon className="h-4 w-4 text-planning" /> Find example videos on YouTube (opens a search)
        </>,
        false,
      )}
      <p className="mt-1.5 text-xs text-ink-soft">
        {audience === "coach"
          ? "No specific video is chosen for this exercise yet: add one with Edit."
          : "Your coach has not chosen a specific video yet."}
      </p>
    </div>
  );
}
