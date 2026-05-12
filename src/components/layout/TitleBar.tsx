import { motion } from "framer-motion";
import { Minus, X, FlaskConical, Keyboard } from "lucide-react";
import { cn } from "@utils/cn";

async function getWindow() {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    return getCurrentWindow();
  } catch {
    return null;
  }
}

interface TitleBarProps {
  className?: string;
  onShowShortcuts?: () => void;
  onShowCommandPalette?: () => void;
}

function WinBtn({
  onClick,
  children,
  className,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "no-drag flex size-[22px] items-center justify-center rounded-full",
        "transition-all duration-150",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

export function TitleBar({ className, onShowShortcuts, onShowCommandPalette }: TitleBarProps) {
  const handleMinimize = async () => {
    const w = await getWindow();
    w?.minimize();
  };

  const handleClose = async () => {
    const w = await getWindow();
    w?.close();
  };

  return (
    <div
      className={cn(
        "drag-region flex h-11 shrink-0 items-center justify-between px-4",
        className
      )}
    >
      {/* ── Left: brand ──────────────────────────────────── */}
      <div className="no-drag flex items-center gap-2.5">
        <motion.div
          whileHover={{ scale: 1.08, rotate: -6 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="flex size-[24px] items-center justify-center rounded-[7px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.55) 100%)",
            border: "1px solid rgba(139,92,246,0.45)",
            boxShadow: "0 0 12px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <FlaskConical size={12} className="text-violet-200" strokeWidth={2} />
        </motion.div>

        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[13px] font-bold tracking-tight"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            PasteLab
          </span>
          <span
            className="rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-widest"
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "rgba(167,139,250,0.8)",
            }}
          >
            Pro
          </span>
        </div>
      </div>

      {/* ── Center: quick-access ──────────────────────────── */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {onShowCommandPalette && (
          <motion.button
            whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.07)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onShowCommandPalette}
            className="no-drag flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors duration-150"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 3v2l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-medium">Actions</span>
            <kbd
              className="rounded px-1 text-[9px] font-bold"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.22)",
              }}
            >
              Ctrl+K
            </kbd>
          </motion.button>
        )}
      </div>

      {/* ── Right: shortcuts + window controls ───────────── */}
      <div className="no-drag flex items-center gap-1">
        {onShowShortcuts && (
          <motion.button
            whileHover={{ scale: 1.08, color: "rgba(255,255,255,0.6)" }}
            whileTap={{ scale: 0.92 }}
            onClick={onShowShortcuts}
            title="Keyboard shortcuts (?)"
            className="flex size-[26px] items-center justify-center rounded-lg transition-colors duration-150"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            <Keyboard size={12} strokeWidth={2} />
          </motion.button>
        )}

        <div
          className="mx-1 h-4 w-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        <WinBtn onClick={handleMinimize} label="Minimize" className="hover:bg-white/10 text-white/25 hover:text-white/60">
          <Minus size={9} strokeWidth={2.5} />
        </WinBtn>
        <WinBtn
          onClick={handleClose}
          label="Close"
          className="hover:bg-red-500/25 text-white/25 hover:text-red-400/90"
        >
          <X size={9} strokeWidth={2.5} />
        </WinBtn>
      </div>
    </div>
  );
}
