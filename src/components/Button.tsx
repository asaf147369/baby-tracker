import type { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  default:
    "border border-border bg-surface text-white hover:bg-surface-hover",
  ghost: "text-muted hover:bg-white/10 hover:text-white",
  danger:
    "border border-danger-hover bg-danger text-amber-100 hover:bg-danger-hover",
  filter:
    "border border-border bg-surface text-muted hover:bg-surface-hover hover:text-white",
  filterActive: "border-border bg-border text-white font-semibold",
} as const;

type Variant = keyof typeof variants;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  active?: boolean;
};

export function Button({
  variant = "default",
  active,
  className = "",
  ...props
}: Props) {
  const variantClass =
    variant === "filter" && active ? variants.filterActive : variants[variant];
  return (
    <button
      type="button"
      className={`${base} ${variantClass} ${className}`.trim()}
      {...props}
    />
  );
}
