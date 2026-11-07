/**
 * A filter chip (D-071, R8): rounded, dark when chosen. Use inside <ChipRow>, which keeps the chips on one
 * line and lets them scroll sideways on phones instead of wrapping into several rows.
 */
export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-9 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition ${
        active ? "bg-ink text-card" : "bg-card text-ink ring-1 ring-inset ring-line hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

export function ChipRow({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 ${className}`} role="group" aria-label={label}>
      <div className="flex w-max gap-2 py-0.5 sm:w-auto sm:flex-wrap">{children}</div>
    </div>
  );
}
