import Link from "next/link";

// The one place where button styles live. Use <Button> for actions, <ButtonLink> for navigation,
// or buttonClass() when another element must look like a button.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-soft";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand shadow-brand hover:bg-brand-hover",
  secondary: "bg-card text-ink shadow-card ring-1 ring-inset ring-line hover:bg-surface",
  ghost: "text-brand-strong hover:bg-brand-soft",
  danger: "bg-danger text-on-brand hover:bg-danger-ink",
  // Destructive but reversible actions, such as cancelling a session.
  "danger-soft": "bg-danger-soft text-danger hover:bg-danger-soft/60 hover:ring-1 hover:ring-inset hover:ring-danger/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 text-xs",
  md: "min-h-10 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-4 py-3 text-base",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string } = {}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-control text-center font-semibold transition",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean };

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: StyleProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} {...props} className={buttonClass({ variant, size, block, className })} />;
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: StyleProps & React.ComponentProps<typeof Link>) {
  return <Link {...props} className={buttonClass({ variant, size, block, className })} />;
}
