import { cn } from "@utils/cn";
import type { ColorScheme, Size } from "@/types";

type BadgeVariant = "solid" | "subtle" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: ColorScheme | "default";
  size?: Extract<Size, "xs" | "sm" | "md">;
  dot?: boolean;
}

const colorStyles: Record<BadgeVariant, Record<string, string>> = {
  solid: {
    default: "bg-bg-overlay text-text border-border",
    violet: "bg-primary text-white border-primary/20",
    cyan: "bg-accent text-white border-accent/20",
    emerald: "bg-success text-white border-success/20",
    amber: "bg-warning text-white border-warning/20",
    rose: "bg-danger text-white border-danger/20",
  },
  subtle: {
    default: "bg-bg-elevated text-text-secondary border-border",
    violet: "bg-primary-subtle text-primary-300 border-primary/20",
    cyan: "bg-accent-subtle text-accent border-accent/20",
    emerald: "bg-success-subtle text-success border-success/20",
    amber: "bg-warning-subtle text-warning border-warning/20",
    rose: "bg-danger-subtle text-danger border-danger/20",
  },
  outline: {
    default: "bg-transparent text-text-secondary border-border-strong",
    violet: "bg-transparent text-primary-300 border-primary/40",
    cyan: "bg-transparent text-accent border-accent/40",
    emerald: "bg-transparent text-success border-success/40",
    amber: "bg-transparent text-warning border-warning/40",
    rose: "bg-transparent text-danger border-danger/40",
  },
};

const dotColorStyles: Record<string, string> = {
  default: "bg-text-muted",
  violet: "bg-primary-400",
  cyan: "bg-accent",
  emerald: "bg-success",
  amber: "bg-warning",
  rose: "bg-danger",
};

const sizeStyles: Record<string, string> = {
  xs: "h-4 px-1.5 text-2xs gap-1",
  sm: "h-5 px-2 text-2xs gap-1",
  md: "h-6 px-2.5 text-xs gap-1.5",
};

export function Badge({
  className,
  variant = "subtle",
  color = "default",
  size = "sm",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "badge-base inline-flex items-center border font-medium",
        colorStyles[variant][color],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            dotColorStyles[color]
          )}
        />
      )}
      {children}
    </span>
  );
}
