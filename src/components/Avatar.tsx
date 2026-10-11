/** Circle with initials, used for groups and participants. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export default function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  return (
    <div
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand-strong ${sizes[size]}`}
    >
      {initials(name)}
    </div>
  );
}
