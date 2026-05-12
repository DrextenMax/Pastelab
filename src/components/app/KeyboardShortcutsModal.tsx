// ─── Keyboard shortcuts modal ─────────────────────────────────────────────────

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

// ── Kbd badge ─────────────────────────────────────────────────────────────────

function Kbd({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {keys.map((k, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderBottom: "2px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.62)",
            minWidth: 22,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {k}
        </kbd>
      ))}
    </div>
  );
}

// ── Shortcut row ─────────────────────────────────────────────────────────────

function ShortcutRow({
  keys,
  label,
  description,
}: {
  keys: string[];
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
          {label}
        </span>
        {description && (
          <p className="mt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.32)" }}>
            {description}
          </p>
        )}
      </div>
      <Kbd keys={keys} />
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span
          className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          {title}
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.07), transparent)" }}
        />
      </div>
      <div
        className="rounded-2xl px-4 divide-y"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.065)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[460px] overflow-hidden rounded-[22px]"
            style={{
              background: "rgba(10,10,22,0.97)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
              maxHeight: "80vh",
            }}
          >
            {/* Top line */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(139,92,246,0.5) 40%, rgba(139,92,246,0.5) 60%, transparent)",
              }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex size-7 items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.28)",
                  }}
                >
                  <Keyboard size={13} style={{ color: "#c4b5fd" }} />
                </div>
                <span
                  className="text-[15px] font-bold tracking-tight"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Keyboard Shortcuts
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.09)" }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-lg transition-colors duration-150"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto px-6 py-5 space-y-5"
              style={{
                maxHeight: "calc(80vh - 68px)",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.1) transparent",
              }}
            >
              <Section title="Global">
                <ShortcutRow
                  keys={["Ctrl", "Shift", "V"]}
                  label="Quick open"
                  description="Paste clipboard & focus PasteLab from anywhere"
                />
                <ShortcutRow
                  keys={["Ctrl", "K"]}
                  label="Command palette"
                  description="Search and run any action"
                />
                <ShortcutRow
                  keys={["?"]}
                  label="Show shortcuts"
                  description="Open this modal"
                />
              </Section>

              <Section title="Editing">
                <ShortcutRow
                  keys={["Ctrl", "V"]}
                  label="Paste"
                  description="Paste from clipboard into the editor"
                />
                <ShortcutRow
                  keys={["Ctrl", "Z"]}
                  label="Undo transform"
                  description="Revert the last applied action"
                />
                <ShortcutRow
                  keys={["Ctrl", "Shift", "C"]}
                  label="Copy result"
                  description="Copy the current text to clipboard"
                />
                <ShortcutRow
                  keys={["Ctrl", "K"]}
                  label="Clear panel"
                  description="Clear all text and reset"
                />
                <ShortcutRow
                  keys={["Esc"]}
                  label="Clear / close"
                  description="Clear text or close an open panel"
                />
              </Section>

              <Section title="Navigation">
                <ShortcutRow
                  keys={["Ctrl", ","]}
                  label="Settings"
                  description="Open preferences panel"
                />
                <ShortcutRow
                  keys={["↑", "↓"]}
                  label="Navigate palette"
                  description="Move selection in command palette"
                />
                <ShortcutRow
                  keys={["↵"]}
                  label="Execute action"
                  description="Run the selected palette item"
                />
              </Section>

              <Section title="Humanize">
                <ShortcutRow keys={["1"]} label="Intensity: Subtle" />
                <ShortcutRow keys={["2"]} label="Intensity: Light" />
                <ShortcutRow keys={["3"]} label="Intensity: Medium" />
                <ShortcutRow keys={["4"]} label="Intensity: Strong" />
                <ShortcutRow keys={["5"]} label="Intensity: Bold" />
                <ShortcutRow keys={["↵"]} label="Apply changes" description="Commit humanized text" />
              </Section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
