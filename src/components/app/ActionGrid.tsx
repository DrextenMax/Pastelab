import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { actionsByType } from "@utils/transforms";
import { useTheme } from "@context/ThemeContext";
import type { ContentType, ClipAction } from "@/types";

// ─── Type accent colours ──────────────────────────────────────────────────────

const TYPE_ACCENT: Record<ContentType, string> = {
  empty:    "#ffffff",
  text:     "#a78bfa",
  ai:       "#d946ef",
  url:      "#06b6d4",
  json:     "#f59e0b",
  code:     "#8b5cf6",
  color:    "#ec4899",
  email:    "#3b82f6",
  csv:      "#10b981",
  secret:   "#ef4444",
  markdown: "#60a5fa",
  number:   "#34d399",
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function actionAccent(action: ClipAction, typeAccent: string): string {
  if (action.variant === "danger")  return "#ef4444";
  if (action.variant === "success") return "#10b981";
  return typeAccent;
}

// ─── Primary action ───────────────────────────────────────────────────────────

interface PrimaryActionProps {
  action: ClipAction;
  onClick: () => void;
  applied: boolean;
  accent: string;
}

function PrimaryAction({ action, onClick, applied, accent }: PrimaryActionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [hovered, setHovered] = useState(false);
  const Icon = action.icon;
  const eff = actionAccent(action, accent);

  const bg = applied
    ? "rgba(16,185,129,0.1)"
    : hovered
    ? hexToRgba(eff, 0.1)
    : "var(--s4)";

  const border = applied
    ? hexToRgba("#10b981", 0.32)
    : hovered
    ? hexToRgba(eff, 0.45)
    : "var(--b4)";

  const shadow = applied
    ? "0 4px 20px rgba(16,185,129,0.18)"
    : hovered
    ? `0 4px 24px ${hexToRgba(eff, 0.22)}, 0 0 0 1px ${hexToRgba(eff, 0.12)}`
    : "none";

  const iconBg = applied
    ? "rgba(16,185,129,0.15)"
    : hovered
    ? hexToRgba(eff, 0.15)
    : "var(--s1)";

  const iconBorder = hovered || applied ? hexToRgba(eff, 0.2) : "var(--b4)";
  const iconColor = applied ? "#6ee7b7" : hovered ? eff : "var(--t3)";
  const labelColor = applied ? "#6ee7b7" : hovered ? (isDark ? "#ffffff" : "rgba(20,15,40,0.96)") : "var(--t1)";

  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.992, x: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="no-drag group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left focus-visible:outline-none"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: shadow,
        transition: "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {/* Left accent bar */}
      <motion.div
        animate={{ opacity: hovered || applied ? 1 : 0, scaleY: hovered || applied ? 1 : 0.4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-3 left-0 top-3 w-[2.5px] origin-center rounded-full"
        style={{ background: applied ? "#10b981" : eff }}
      />

      {/* Icon */}
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          transition: "background 0.18s ease, border-color 0.18s ease",
        }}
      >
        <Icon size={15} strokeWidth={2} style={{ color: iconColor, transition: "color 0.18s ease" }} />
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className="text-[13px] font-semibold leading-tight"
          style={{ color: labelColor, transition: "color 0.18s ease" }}
        >
          {applied ? "Applied" : action.label}
        </span>
        {action.description && !applied && (
          <span className="truncate text-[11px]" style={{ color: "var(--t6)" }}>
            {action.description}
          </span>
        )}
      </div>

      {/* Right: shortcut + check + arrow */}
      <div className="flex shrink-0 items-center gap-1.5">
        {applied && (
          <span className="text-[13px] font-bold" style={{ color: "#10b981" }}>✓</span>
        )}
        {action.shortcut && !applied && (
          <kbd
            className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: "var(--s3)",
              border: "1px solid var(--b4)",
              color: hovered ? hexToRgba(eff, 0.9) : "var(--t6)",
              transition: "color 0.18s ease",
            }}
          >
            {action.shortcut}
          </kbd>
        )}
        <motion.span
          animate={{ opacity: hovered && !applied ? 0.6 : 0, x: hovered ? 0 : -5 }}
          transition={{ duration: 0.15 }}
          style={{ color: eff, fontSize: "12px", lineHeight: 1 }}
        >
          →
        </motion.span>
      </div>
    </motion.button>
  );
}

// ─── Secondary action ─────────────────────────────────────────────────────────

interface SecondaryActionProps {
  action: ClipAction;
  onClick: () => void;
  applied: boolean;
  accent: string;
  delay: number;
}

function SecondaryAction({ action, onClick, applied, accent, delay }: SecondaryActionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [hovered, setHovered] = useState(false);
  const Icon = action.icon;
  const eff = actionAccent(action, accent);

  const bg = applied
    ? "rgba(16,185,129,0.12)"
    : hovered
    ? hexToRgba(eff, 0.1)
    : "var(--s3)";

  const border = applied
    ? hexToRgba("#10b981", 0.3)
    : hovered
    ? hexToRgba(eff, 0.38)
    : "var(--b2)";

  const iconColor = applied ? "#6ee7b7" : hovered ? eff : "var(--t4)";
  const textColor = applied
    ? "#6ee7b7"
    : hovered
    ? (isDark ? "rgba(255,255,255,0.95)" : "rgba(20,15,40,0.92)")
    : "var(--t3)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.button
        whileHover={{ scale: 1.04, y: -1.5 }}
        whileTap={{ scale: 0.96 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onClick}
        className="no-drag flex items-center gap-1.5 rounded-xl px-3 py-2 focus-visible:outline-none"
        style={{
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: hovered ? `0 4px 16px ${hexToRgba(eff, 0.22)}` : "none",
          transition: "background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease",
        }}
      >
        <Icon size={12} strokeWidth={2} style={{ color: iconColor, flexShrink: 0, transition: "color 0.16s ease" }} />
        <span className="whitespace-nowrap text-[12px] font-medium" style={{ color: textColor, transition: "color 0.16s ease" }}>
          {applied ? "Done ✓" : action.label}
        </span>
      </motion.button>
    </motion.div>
  );
}

// ─── ActionGrid ───────────────────────────────────────────────────────────────

interface ActionGridProps {
  contentType: ContentType;
  onAction: (actionId: string) => void;
  appliedAction?: string | null;
}

export function ActionGrid({ contentType, onAction, appliedAction }: ActionGridProps) {
  const actions = actionsByType[contentType] ?? [];
  if (actions.length === 0) return null;

  const [primary, ...secondary] = actions;
  const accent = TYPE_ACCENT[contentType] ?? "#8b5cf6";

  return (
    <div className="px-5 pb-4">
      {/* Section header */}
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--t7)" }}
        >
          Actions
        </span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--b4), transparent)" }} />
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold tabular-nums"
          style={{ background: "var(--s4)", border: "1px solid var(--b4)", color: "var(--t7)" }}
        >
          {actions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={contentType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <PrimaryAction
            action={primary}
            onClick={() => onAction(primary.id)}
            applied={appliedAction === primary.id}
            accent={accent}
          />

          {secondary.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {secondary.slice(0, 8).map((action, i) => (
                <SecondaryAction
                  key={action.id}
                  action={action}
                  onClick={() => onAction(action.id)}
                  applied={appliedAction === action.id}
                  accent={accent}
                  delay={0.05 + i * 0.035}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
