// ─── Toast container ─────────────────────────────────────────────────────────
// Renders the live toast stack in the bottom-right corner.
// Each toast slides in from the right with a spring, then slides out.
// A thin progress bar counts down the auto-dismiss duration.

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast, type ToastItem, type ToastVariant } from "@context/ToastContext";

// ── Per-variant style map ─────────────────────────────────────────────────────

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: React.ElementType; iconColor: string; barColor: string; border: string; glow: string }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "#34d399",
    barColor: "#10b981",
    border: "rgba(52,211,153,0.22)",
    glow: "rgba(16,185,129,0.12)",
  },
  error: {
    icon: XCircle,
    iconColor: "#f87171",
    barColor: "#ef4444",
    border: "rgba(248,113,113,0.22)",
    glow: "rgba(239,68,68,0.12)",
  },
  info: {
    icon: Info,
    iconColor: "#60a5fa",
    barColor: "#3b82f6",
    border: "rgba(96,165,250,0.22)",
    glow: "rgba(59,130,246,0.12)",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "#fbbf24",
    barColor: "#f59e0b",
    border: "rgba(251,191,36,0.22)",
    glow: "rgba(245,158,11,0.12)",
  },
};

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ duration, barColor }: { duration: number; barColor: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    // Start at 100%, animate to 0 over `duration` ms
    el.style.transition = "none";
    el.style.width = "100%";
    // Force reflow
    void el.offsetWidth;
    el.style.transition = `width ${duration}ms linear`;
    el.style.width = "0%";
  }, [duration]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      <div
        ref={barRef}
        className="h-full rounded-b-xl"
        style={{ background: barColor }}
      />
    </div>
  );
}

// ── Single toast ─────────────────────────────────────────────────────────────

function Toast({ item }: { item: ToastItem }) {
  const { toast } = useToast();
  const v = VARIANT_STYLES[item.variant];
  const Icon = v.icon;
  const dur = item.duration ?? 2800;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.93 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 56, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden"
      style={{
        background: "rgba(10, 10, 22, 0.92)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${v.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.45), inset 0 0 0 50px ${v.glow}`,
        minWidth: 240,
        maxWidth: 340,
      }}
    >
      {/* Icon */}
      <Icon size={16} strokeWidth={2} style={{ color: v.iconColor, flexShrink: 0 }} />

      {/* Message */}
      <span
        className="flex-1 text-[13px] font-medium leading-snug"
        style={{ color: "rgba(255,255,255,0.88)" }}
      >
        {item.message}
      </span>

      {/* Dismiss button */}
      <button
        onClick={() => toast.dismiss(item.id)}
        className="flex items-center justify-center size-5 rounded-md transition-colors"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        <X size={12} strokeWidth={2.5} />
      </button>

      {/* Progress bar */}
      <ProgressBar duration={dur} barColor={v.barColor} />
    </motion.div>
  );
}

// ── Container ─────────────────────────────────────────────────────────────────

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
      style={{ alignItems: "flex-end" }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast item={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
