import { forwardRef } from "react";
import { cn } from "@utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, iconRight, error, label, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 flex shrink-0 text-text-muted">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "no-drag h-9 w-full rounded-xl border border-border bg-bg-elevated px-3 text-sm text-text",
              "placeholder:text-text-muted",
              "transition-all duration-150",
              "focus:border-primary/60 focus:bg-bg-surface focus:outline-none focus:ring-1 focus:ring-primary/30",
              "disabled:opacity-40",
              error && "border-danger/50 focus:border-danger/70 focus:ring-danger/20",
              icon && "pl-9",
              iconRight && "pr-9",
              className
            )}
            {...props}
          />

          {iconRight && (
            <span className="absolute right-3 flex shrink-0 text-text-muted">
              {iconRight}
            </span>
          )}
        </div>

        {(error ?? hint) && (
          <p
            className={cn(
              "text-2xs",
              error ? "text-danger" : "text-text-muted"
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
