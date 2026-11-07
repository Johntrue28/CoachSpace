import { photoSrc } from "@/data/look";

/**
 * A demo photo (D-074): served from /public/photos in two widths, cropped to fill its box. Decorative
 * photos pass alt="" so screen readers skip them.
 */
export default function Photo({
  name,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 768px) 640px, 100vw",
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static demo photos in two prepared widths
    <img
      src={photoSrc(name, 640)}
      srcSet={`${photoSrc(name, 640)} 640w, ${photoSrc(name, 1280)} 1280w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`block h-full w-full object-cover ${className}`}
    />
  );
}
