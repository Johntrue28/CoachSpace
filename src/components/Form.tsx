// Small shared form building blocks so all forms look and behave the same.
import { Button } from "@/components/ui/Button";

// 16 px on phones so iOS does not zoom into the field; 14 px from the sm breakpoint, as in the design.
export const inputClass =
  "w-full rounded-control bg-card px-3 py-2.5 text-base text-ink ring-1 ring-inset ring-line outline-none placeholder:text-ink-soft focus:ring-2 focus:ring-brand sm:text-sm";

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
        <span role="alert" className="mt-1 block text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button type="submit" size="lg" block {...props} />;
}
