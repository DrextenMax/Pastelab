import { motion, AnimatePresence } from "framer-motion";
import { Minus, X, FlaskConical, Keyboard, Sun, Moon, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@utils/cn";
import { useTheme } from "@context/ThemeContext";

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
  focusMode?: boolean;
  onToggleFocus?: () => void;
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

export function TitleBar({ className, onShowShortcuts, onShowCommandPalette, focusMode, onToggleFocus }: TitleBarProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const handleMinimize = async () => {
    const w = await getWindow();
    w?.minimize();
  };

  const handleClose = async () => {
    const w = await getWindow();
    w?.close();
  };

  const textMuted   = isDark ? "rgba(255,255,255,0.22)" : "rgba(20,15,40,0.35)";
  const textBrand   = isDark ? "rgba(255,255,255,0.88)" : "rgba(20,15,40,0.88)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(109,40,217,0.12)";

  return (
    <div
      className={cn(
        "drag-region relative flex h-11 shrink-0 items-center justify-between px-4",
        className
      )}
      style={{
        background: isDark ? "rgba(109,40,217,0.04)" : "rgba(109,40,217,0.03)",
        transition: "background 0.4s",
      }}
    >
      {/* Bottom gradient separator */}
      <div
        className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(109,40,217,0.45) 30%, rgba(6,182,212,0.35) 60%, transparent)"
            : "linear-gradient(to right, transparent, rgba(109,40,217,0.30) 30%, rgba(6,182,212,0.22) 60%, transparent)",
          transition: "background 0.4s",
        }}
      />

      {/* ── Left: brand ──────────────────────────────────── */}
      <div className="no-drag flex items-center gap-2.5">
        <motion.div
          whileHover={{ scale: 1.08, rotate: -6 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="flex size-[24px] items-center justify-center rounded-[7px]"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.55) 100%)",
            border: "1px solid rgba(139,92,246,0.45)",
            boxShadow: "0 0 12px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <FlaskConical size={12} className="text-violet-200" strokeWidth={2} />
        </motion.div>

        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[13px] font-bold tracking-tight"
            style={{ color: textBrand, transition: "color 0.4s" }}
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
            whileHover={{ scale: 1.04, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(109,40,217,0.08)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onShowCommandPalette}
            className="no-drag flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors duration-150"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(109,40,217,0.05)",
              border: `1px solid ${borderColor}`,
              color: textMuted,
              transition: "background 0.4s, border-color 0.4s",
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
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(109,40,217,0.07)",
                border: `1px solid ${borderColor}`,
                color: textMuted,
              }}
            >
              Ctrl+K
            </kbd>
          </motion.button>
        )}
      </div>

      {/* ── Right: shortcuts + theme toggle + window controls ── */}
      <div className="no-drag flex items-center gap-1">
        {onShowShortcuts && (
          <motion.button
            whileHover={{ scale: 1.08, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(20,15,40,0.7)" }}
            whileTap={{ scale: 0.92 }}
            onClick={onShowShortcuts}
            title="Keyboard shortcuts (?)"
            className="flex size-[26px] items-center justify-center rounded-lg transition-colors duration-150"
            style={{ color: textMuted }}
          >
            <Keyboard size={12} strokeWidth={2} />
          </motion.button>
        )}

        {/* Focus mode toggle */}
        {onToggleFocus && (
          <motion.button
            whileHover={{ scale: 1.08, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(20,15,40,0.7)" }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleFocus}
            title={focusMode ? "Exit focus mode (Ctrl+Shift+F)" : "Focus mode (Ctrl+Shift+F)"}
            className="flex size-[26px] items-center justify-center rounded-lg transition-colors duration-150"
            style={{
              color: focusMode ? "#a78bfa" : textMuted,
              background: focusMode
                ? (isDark ? "rgba(167,139,250,0.12)" : "rgba(109,40,217,0.1)")
                : "transparent",
              transition: "color 0.2s, background 0.2s",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={focusMode ? "maximize" : "minimize"}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ display: "flex" }}
              >
                {focusMode ? <Maximize2 size={12} strokeWidth={2} /> : <Minimize2 size={12} strokeWidth={2} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggle}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex size-[26px] items-center justify-center rounded-lg transition-colors duration-150"
          style={{ color: textMuted }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ display: "flex" }}
            >
              {isDark ? <Sun size={12} strokeWidth={2} /> : <Moon size={12} strokeWidth={2} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <div
          className="mx-1 h-4 w-px"
          style={{ background: borderColor, transition: "background 0.4s" }}
        />

        <WinBtn
          onClick={handleMinimize}
          label="Minimize"
          className={isDark ? "hover:bg-white/10 text-white/25 hover:text-white/60" : "hover:bg-black/10 text-black/20 hover:text-black/50"}
        >
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

