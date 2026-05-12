import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@utils/cn";
import type { Size, Variant } from "@/types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  default:
    "bg-bg-elevated border border-border text-text hover:bg-bg-overlay hover:border-border-strong",
  primary:
    "bg-primary text-white border border-primary/20 hover:bg-primary-hover shadow-glow-sm hover:shadow-glow",
  ghost:
    "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text border border-transparent",
  danger:
    "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/40",
  outline:
    "bg-transparent border border-border-strong text-text hover:border-primary/60 hover:text-primary-300",
};

const sizeStyles: Record<Size, string> = {
  xs: "h-6 px-2 text-2xs gap-1 rounded-lg",
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-5 text-base gap-2 rounded-xl",
  xl: "h-13 px-6 text-lg gap-3 rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        className={cn(
          "no-drag relative inline-flex items-center justify-center font-medium",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          "disabled:pointer-events-none disabled:opacity-40",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
