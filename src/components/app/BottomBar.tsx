import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, ClipboardPaste, Trash2, CheckCheck, Settings2, Keyboard, Undo2,
} from "lucide-react";
import { cn } from "@utils/cn";

interface BottomBarProps {
  hasContent: boolean;
  onCopy: () => void;
  onPasteFromClipboard: () => void;
  onClear: () => void;
  appliedCount: number;
  canUndo: boolean;
  onUndo: () => void;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
}

// ── Icon button ──────────────────────────────────────────────────────────────

function BarButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  success,
  disabled,
  title,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "ghost" | "danger";
  success?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const styles = {
    default: {
      bg: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.09)",
      color: "rgba(255,255,255,0.52)",
      hoverBg: "rgba(255,255,255,0.09)",
    },
    primary: {
      bg: "rgba(109,40,217,0.2)",
      border: "rgba(139,92,246,0.32)",
      color: "#c4b5fd",
      hoverBg: "rgba(109,40,217,0.3)",
    },
    ghost: {
      bg: "transparent",
      border: "transparent",
      color: "rgba(255,255,255,0.25)",
      hoverBg: "rgba(255,255,255,0.06)",
    },
    danger: {
      bg: "rgba(239,68,68,0.07)",
      border: "rgba(239,68,68,0.18)",
      color: "rgba(248,113,113,0.65)",
      hoverBg: "rgba(239,68,68,0.13)",
    },
  };

  const s = success
    ? { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.26)", color: "#6ee7b7", hoverBg: "rgba(16,185,129,0.16)" }
    : styles[variant];

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.04, y: -0.5 } : undefined}
      whileTap={!disabled ? { scale: 0.94 } : undefined}
      onClick={disabled ? undefined : onClick}
      title={title}
      className={cn(
        "no-drag flex items-center gap-1.5 rounded-xl px-3 py-1.5",
        "text-[12px] font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/40",
        disabled && "pointer-events-none opacity-28"
      )}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
      }}
    >
      <Icon size={13} strokeWidth={2} />
      {label && <span>{label}</span>}
    </motion.button>
  );
}

// ── Bottom bar ────────────────────────────────────────────────────────────────

export function BottomBar({
  hasContent,
  onCopy,
  onPasteFromClipboard,
  onClear,
  appliedCount,
  canUndo,
  onUndo,
  onOpenSettings,
  onOpenShortcuts,
}: BottomBarProps) {
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePaste = () => {
    onPasteFromClipboard();
    setPasted(true);
    setTimeout(() => setPasted(false), 2200);
  };

  return (
    <div
      className="flex shrink-0 items-center gap-2 px-4 py-2.5"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.055)",
        background: "rgba(0,0,0,0.18)",
      }}
    >
      {/* ── Left: primary actions ──────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <BarButton
          icon={copied ? CheckCheck : Copy}
          label={copied ? "Copied!" : "Copy"}
          onClick={handleCopy}
          variant="default"
          success={copied}
          disabled={!hasContent}
          title="Copy result  Ctrl+Shift+C"
        />
        <BarButton
          icon={pasted ? CheckCheck : ClipboardPaste}
          label={pasted ? "Pasted!" : "Paste"}
          onClick={handlePaste}
          variant="primary"
          success={pasted}
          title="Paste from clipboard"
        />

        <AnimatePresence>
          {canUndo && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <BarButton
                icon={Undo2}
                label="Undo"
                onClick={onUndo}
                variant="default"
                title="Undo last transform  Ctrl+Z"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <BarButton
          icon={Trash2}
          label="Clear"
          onClick={onClear}
          variant="danger"
          disabled={!hasContent}
          title="Clear  Ctrl+K"
        />
      </div>

      {/* ── Center: status indicator ───────────────────────────── */}
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {appliedCount > 0 ? (
            <motion.div
              key="applied"
              initial={{ opacity: 0, y: 5, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.14)",
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="size-1.5 rounded-full"
                style={{ background: "#10b981", boxShadow: "0 0 5px rgba(16,185,129,0.55)" }}
              />
              <span className="text-[11px] font-semibold" style={{ color: "#6ee7b7" }}>
                {appliedCount} transform{appliedCount !== 1 ? "s" : ""} applied
              </span>
            </motion.div>
          ) : hasContent ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <div
                className="size-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                Ready to transform
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <Keyboard size={10} style={{ color: "rgba(255,255,255,0.16)" }} />
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
                Paste to start
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: tool buttons ────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {onOpenShortcuts && (
          <BarButton
            icon={Keyboard}
            label=""
            onClick={onOpenShortcuts}
            variant="ghost"
            title="Keyboard shortcuts  ?"
          />
        )}
        {onOpenSettings && (
          <BarButton
            icon={Settings2}
            label=""
            onClick={onOpenSettings}
            variant="ghost"
            title="Settings  Ctrl+,"
          />
        )}
      </div>
    </div>
  );
}
