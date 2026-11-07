/** Circle with initials, used for groups and participants. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export default function Avatar({
  name,
  size = "md",
  colour,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  /** A group's colour (D-074): its soft tint behind its solid colour. */
  colour?: { solid: string; soft: string };
}) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  return (
    <div
      aria-hidden
      style={colour ? { backgroundColor: colour.soft, color: colour.solid } : undefined}
      className={`grid shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand-strong ${sizes[size]}`}
    >
      {initials(name)}
    </div>
  );
}
