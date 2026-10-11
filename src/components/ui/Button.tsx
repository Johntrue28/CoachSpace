import Link from "next/link";

// The one place where button styles live. Use <Button> for actions, <ButtonLink> for navigation,
// or buttonClass() when another element must look like a button.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "bg-card text-ink ring-1 ring-inset ring-line-strong hover:bg-sunken",
  ghost: "text-brand hover:bg-brand-soft",
  danger: "bg-danger text-on-brand hover:bg-danger-ink",
  "danger-outline": "bg-card text-danger ring-1 ring-inset ring-line-strong hover:bg-danger-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-12 px-4 py-3 text-base",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string } = {}) {
  return [
    "inline-flex items-center justify-center gap-1.5 rounded-control text-center font-semibold transition-colors",
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
