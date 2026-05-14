// ─── Settings panel ──────────────────────────────────────────────────────────
// Slide-in side panel from the right.

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Settings2, Bell, History, Trash2, Zap, Info, CheckCircle2,
} from "lucide-react";
import type { ClipFixSettings } from "@hooks/useSettings";
import { useClipboardHistory } from "@hooks/useClipboardHistory";
import { useTheme } from "@context/ThemeContext";

// ── Toggle switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.93 } : undefined}
      onClick={() => !disabled && onChange(!checked)}
      className={`no-drag relative flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${disabled ? "opacity-40 pointer-events-none" : ""}`}
      style={{
        background: checked ? "rgba(109,40,217,0.85)" : "var(--s2)",
        border: `1px solid ${checked ? "rgba(139,92,246,0.5)" : "var(--b2)"}`,
        boxShadow: checked ? "0 0 10px rgba(109,40,217,0.35)" : "none",
      }}
    >
      <motion.span
        layout
        animate={{ x: checked ? 16 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="block size-3.5 rounded-full"
        style={{
          background: checked ? "#fff" : "var(--t5)",
          boxShadow: checked ? "0 1px 3px rgba(0,0,0,0.35)" : "none",
        }}
      />
    </motion.button>
  );
}

// ── Setting row ──────────────────────────────────────────────────────────────

interface SettingRowProps {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  description: string;
  control: React.ReactNode;
}

function SettingRow({ icon: Icon, iconColor, label, description, control }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}28` }}
        >
          <Icon size={13} style={{ color: iconColor }} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium" style={{ color: "var(--t2)" }}>
            {label}
          </p>
          <p className="text-[11px]" style={{ color: "var(--t6)" }}>
            {description}
          </p>
        </div>
      </div>
      {control}
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span
          className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--t7)" }}
        >
          {title}
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(to right, var(--b4), transparent)" }}
        />
      </div>
      <div
        className="rounded-2xl px-4 divide-y"
        style={{ background: "var(--s5)", border: "1px solid var(--b5)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Info chip ────────────────────────────────────────────────────────────────

function InfoChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-3 py-2"
      style={{ background: "var(--s6)", border: "1px solid var(--b6)" }}
    >
      <span className="text-[12px]" style={{ color: "var(--t5)" }}>{label}</span>
      <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--t3)" }}>
        {value}
      </span>
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: ClipFixSettings;
  onSet: <K extends keyof ClipFixSettings>(key: K, value: ClipFixSettings[K]) => void;
  onReset: () => void;
}

export function SettingsPanel({ open, onClose, settings, onSet, onReset }: SettingsPanelProps) {
  const { history, clear: clearHistory } = useClipboardHistory();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const panelBg     = isDark ? "rgba(10,10,22,0.98)"       : "rgba(248,246,255,0.98)";
  const panelBorder = isDark ? "rgba(255,255,255,0.085)"   : "rgba(109,40,217,0.18)";
  const panelShadow = isDark
    ? "0 32px 80px rgba(0,0,0,0.75), -8px 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 32px 80px rgba(109,40,217,0.12), -8px 0 40px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.8)";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-5 top-5 bottom-5 z-50 w-[340px] overflow-hidden rounded-[22px]"
            style={{
              background: panelBg,
              border: `1px solid ${panelBorder}`,
              boxShadow: panelShadow,
              transition: "background 0.4s, border-color 0.4s",
            }}
          >
            {/* Top accent */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(139,92,246,0.55) 40%, rgba(139,92,246,0.55) 60%, transparent)",
              }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--b5)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex size-7 items-center justify-center rounded-lg"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.28)" }}
                >
                  <Settings2 size={13} style={{ color: "#c4b5fd" }} />
                </div>
                <span
                  className="text-[15px] font-bold tracking-tight"
                  style={{ color: "var(--t1)" }}
                >
                  Preferences
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-lg"
                style={{
                  background: "var(--s4)",
                  border: "1px solid var(--b3)",
                  color: "var(--t5)",
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto px-5 py-5 space-y-5"
              style={{
                height: "calc(100% - 60px)",
                scrollbarWidth: "thin",
                scrollbarColor: "var(--b2) transparent",
              }}
            >
              {/* ── Clipboard ─────────────────────────────── */}
              <Section title="Clipboard">
                <SettingRow
                  icon={Zap}
                  iconColor="#a78bfa"
                  label="Auto-detect changes"
                  description="Watch clipboard and load new content automatically"
                  control={
                    <Toggle
                      checked={settings.watcherEnabled}
                      onChange={(v) => onSet("watcherEnabled", v)}
                    />
                  }
                />
                <SettingRow
                  icon={History}
                  iconColor="#06b6d4"
                  label="Clipboard history"
                  description="Remember up to 50 recent entries"
                  control={
                    <Toggle
                      checked={settings.historyEnabled}
                      onChange={(v) => onSet("historyEnabled", v)}
                    />
                  }
                />
              </Section>

              {/* ── Notifications ──────────────────────────── */}
              <Section title="Notifications">
                <SettingRow
                  icon={Bell}
                  iconColor="#f59e0b"
                  label="Toast notifications"
                  description="Show feedback toasts for clipboard actions"
                  control={
                    <Toggle
                      checked={settings.toastsEnabled}
                      onChange={(v) => onSet("toastsEnabled", v)}
                    />
                  }
                />
              </Section>

              {/* ── History ────────────────────────────────── */}
              <Section title="History">
                <div className="py-3 space-y-2">
                  <InfoChip label="Saved entries" value={history.length} />
                  <InfoChip label="Storage limit" value="50 entries" />
                  <motion.button
                    whileHover={{ scale: 1.01, background: "rgba(239,68,68,0.12)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => clearHistory()}
                    className="no-drag mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 transition-colors duration-150"
                    style={{
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.18)",
                      color: "rgba(248,113,113,0.75)",
                    }}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                    <span className="text-[12.5px] font-semibold">Clear history</span>
                  </motion.button>
                </div>
              </Section>

              {/* ── About ──────────────────────────────────── */}
              <Section title="About">
                <div className="py-3 space-y-2">
                  <InfoChip label="App" value="PasteLab" />
                  <InfoChip label="Version" value="1.0.0" />
                  <InfoChip label="Edition" value="Pro" />
                  <InfoChip label="Author" value="Drextenmax" />
                  <div
                    className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                    style={{
                      background: "rgba(139,92,246,0.06)",
                      border: "1px solid rgba(139,92,246,0.15)",
                    }}
                  >
                    <CheckCircle2 size={13} style={{ color: "#a78bfa", marginTop: 1, flexShrink: 0 }} strokeWidth={2} />
                    <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--t5)" }}>
                      All transforms run locally. No data is ever sent to external servers.
                    </p>
                  </div>
                  <p className="text-center text-[11px] pt-1" style={{ color: "var(--t8)" }}>
                    Built with ❤️ in La Mancha
                  </p>
                </div>
              </Section>

              {/* ── Reset ─────────────────────────────────── */}
              <div>
                <motion.button
                  whileHover={{ scale: 1.01, background: "var(--s2)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onReset}
                  className="no-drag flex w-full items-center justify-center gap-2 rounded-2xl py-3 transition-colors duration-150"
                  style={{
                    background: "var(--s4)",
                    border: "1px solid var(--b3)",
                    color: "var(--t5)",
                  }}
                >
                  <Info size={13} strokeWidth={2} />
                  <span className="text-[12.5px] font-semibold">Reset to defaults</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
