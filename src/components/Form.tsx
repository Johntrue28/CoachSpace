// Small shared form building blocks so all forms look and behave the same.

export const inputClass =
  "w-full rounded-xl bg-card px-3 py-2.5 text-sm ring-1 ring-line outline-none placeholder:text-ink-soft focus:ring-2 focus:ring-brand";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <span role="alert" className="mt-1 block text-xs font-medium text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}
