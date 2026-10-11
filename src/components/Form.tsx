// Small shared form building blocks so all forms look and behave the same.
import { Button } from "@/components/ui/Button";

export const inputClass =
  "w-full rounded-control bg-card px-3 py-2.5 text-[15px] ring-1 ring-inset ring-line-strong outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-brand";

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
      {hint && <span className="mt-0.5 block text-[13px] text-ink-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <span role="alert" className="mt-1 block text-[13px] font-medium text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button type="submit" size="lg" block {...props} />;
}
