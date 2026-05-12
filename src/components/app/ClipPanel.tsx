import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TitleBar } from "@components/layout/TitleBar";
import { ClipInput } from "./ClipInput";
import { DetectionBar } from "./DetectionBar";
import { ActionGrid } from "./ActionGrid";
import { HumanizePanel } from "./HumanizePanel";
import { PreviewPanel } from "./PreviewPanel";
import { BottomBar } from "./BottomBar";
import { OnboardingModal } from "./OnboardingModal";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { SettingsPanel } from "./SettingsPanel";
import { CommandPalette } from "./CommandPalette";
import { useDetection } from "@hooks/useDetection";
import { useClipboardWatcher, markOwnWrite } from "@hooks/useClipboardWatcher";
import { useClipboardHistory } from "@hooks/useClipboardHistory";
import { useSettings } from "@hooks/useSettings";
import { useToast } from "@context/ToastContext";
import { readClipText, writeClipText } from "@utils/clipboard";
import { transformFns } from "@utils/transforms";

// ── Global shortcut helpers ──────────────────────────────────────────────────

async function registerQuickOpen(onOpen: () => void) {
  try {
    const { register } = await import("@tauri-apps/plugin-global-shortcut");
    await register("CommandOrControl+Shift+V", onOpen);
  } catch { /* browser / dev */ }
}
async function unregisterQuickOpen() {
  try {
    const { unregister } = await import("@tauri-apps/plugin-global-shortcut");
    await unregister("CommandOrControl+Shift+V");
  } catch {}
}

// ── Panel styles ─────────────────────────────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(9, 9, 21, 0.88)",
  backdropFilter: "blur(32px) saturate(1.4) brightness(1.06)",
  WebkitBackdropFilter: "blur(32px) saturate(1.4) brightness(1.06)",
  border: "1px solid rgba(255, 255, 255, 0.072)",
  boxShadow:
    "0 0 0 0.5px rgba(255,255,255,0.04), 0 48px 120px rgba(0,0,0,0.78), 0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const DIVIDER: React.CSSProperties = {
  height: "1px",
  background:
    "linear-gradient(to right, transparent, rgba(255,255,255,0.065) 20%, rgba(255,255,255,0.065) 80%, transparent)",
};

interface HistoryEntry {
  actionId: string;
  valueBefore: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export function ClipPanel() {
  const [value, setValue] = useState("");
  const [original, setOriginal] = useState("");
  const [transformed, setTransformed] = useState("");
  const [appliedAction, setAppliedAction] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHumanize, setShowHumanize] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const { result, analyzing } = useDetection(value);
  const { toast } = useToast();
  const { settings, set: setSetting, reset: resetSettings } = useSettings();
  const { push: pushHistory } = useClipboardHistory();

  // ── First-run onboarding ───────────────────────────────────────────────────
  useEffect(() => {
    if (!settings.onboarded) {
      const t = setTimeout(() => setShowOnboarding(true), 600);
      return () => clearTimeout(t);
    }
  }, [settings.onboarded]);

  const handleOnboardingDone = useCallback(() => {
    setShowOnboarding(false);
    setSetting("onboarded", true);
  }, [setSetting]);

  // ── Track original before any transform ───────────────────────────────────
  useEffect(() => {
    if (value && !transformed) setOriginal(value);
  }, [value, transformed]);

  // ── Color CSS var for swatch ───────────────────────────────────────────────
  useEffect(() => {
    if (result.type === "color") {
      document.documentElement.style.setProperty("--clip-color", value.trim());
    }
  }, [result.type, value]);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────
  const paletteOpenRef = useRef(false);
  paletteOpenRef.current = showCommandPalette;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      // Ctrl+K → command palette
      if (ctrl && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((v) => !v);
        return;
      }
      // Ctrl+, → settings
      if (ctrl && e.key === ",") {
        e.preventDefault();
        setShowSettings((v) => !v);
        return;
      }
      // ? → shortcuts (when not in an input)
      if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Clipboard watcher ─────────────────────────────────────────────────────
  const watcherEnabled = settings.watcherEnabled && value.trim() === "";

  const flash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 650);
  }, []);

  const handleClipboardChange = useCallback(
    (text: string) => {
      setValue(text);
      setOriginal(text);
      setTransformed("");
      setAppliedAction(null);
      setHistory([]);
      setShowHumanize(false);
      if (settings.historyEnabled) pushHistory(text);
      flash();
      if (settings.toastsEnabled) toast.info("Clipboard updated");
    },
    [pushHistory, toast, settings, flash]
  );

  useClipboardWatcher({ onChanged: handleClipboardChange, enabled: watcherEnabled });

  // ── Global shortcut: Ctrl+Shift+V ────────────────────────────────────────
  const handleQuickOpen = useCallback(async () => {
    const text = await readClipText();
    if (!text.trim()) return;
    setValue(text);
    setOriginal(text);
    setTransformed("");
    setAppliedAction(null);
    setHistory([]);
    setShowHumanize(false);
    if (settings.historyEnabled) pushHistory(text);
    flash();
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await win.show();
      await win.setFocus();
    } catch {}
  }, [pushHistory, settings, flash]);

  useEffect(() => {
    registerQuickOpen(handleQuickOpen);
    return () => { unregisterQuickOpen(); };
  }, [handleQuickOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (v: string) => {
    setValue(v);
    setTransformed("");
    setAppliedAction(null);
    setHistory([]);
    setOriginal(v);
  };

  const handleAction = useCallback((actionId: string) => {
    if (actionId === "humanize") { setShowHumanize(true); return; }
    const fn = transformFns[actionId];
    if (!fn) return;
    try {
      const next = fn(value);
      setHistory((h) => [...h, { actionId, valueBefore: value }]);
      setTransformed(next);
      setAppliedAction(actionId);
      setValue(next);
    } catch {}
  }, [value]);

  const handleHumanizeApply = (next: string) => {
    setHistory((h) => [...h, { actionId: "humanize", valueBefore: value }]);
    setTransformed(next);
    setAppliedAction("humanize");
    setValue(next);
    setShowHumanize(false);
  };

  const handleUndo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    const newHistory = history.slice(0, -1);
    setValue(last.valueBefore);
    setHistory(newHistory);
    setAppliedAction(newHistory.length > 0 ? newHistory[newHistory.length - 1].actionId : null);
    if (newHistory.length === 0) setTransformed("");
  };

  const handleRevert = () => {
    setValue(original);
    setTransformed("");
    setAppliedAction(null);
    setHistory([]);
    setShowHumanize(false);
  };

  const handleCopy = useCallback(async () => {
    if (!value.trim()) return;
    try {
      markOwnWrite(value);
      await writeClipText(value);
      if (settings.toastsEnabled) toast.success("Copied to clipboard!");
    } catch {
      try {
        await navigator.clipboard.writeText(value);
        if (settings.toastsEnabled) toast.success("Copied to clipboard!");
      } catch {
        if (settings.toastsEnabled) toast.error("Copy failed");
      }
    }
  }, [value, toast, settings.toastsEnabled]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await readClipText();
      if (!text.trim()) {
        if (settings.toastsEnabled) toast.warning("Clipboard is empty");
        return;
      }
      setValue(text);
      setOriginal(text);
      setTransformed("");
      setAppliedAction(null);
      setHistory([]);
      setShowHumanize(false);
      if (settings.historyEnabled) pushHistory(text);
      if (settings.toastsEnabled) toast.info("Pasted from clipboard");
    } catch {
      if (settings.toastsEnabled) toast.error("Could not read clipboard");
    }
  }, [pushHistory, toast, settings]);

  const handleClear = () => {
    setValue("");
    setOriginal("");
    setTransformed("");
    setAppliedAction(null);
    setHistory([]);
    setShowHumanize(false);
  };

  // ── Command palette action ────────────────────────────────────────────────
  const handlePaletteAction = useCallback((id: string) => {
    handleAction(id);
  }, [handleAction]);

  const canUndo = history.length > 0;
  const historyIds = history.map((h) => h.actionId);

  return (
    <>
      {/* ── Main panel ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.06 }}
          className="relative flex flex-col w-full max-w-[780px] overflow-hidden rounded-[24px]"
          style={{ ...PANEL_STYLE, maxHeight: "calc(100vh - 2.5rem)" }}
        >
          {/* Top shimmer line */}
          <div
            className="absolute inset-x-0 top-0 h-px pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.2) 75%, transparent)",
            }}
          />

          {/* Clipboard-paste flash ring */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                key="flash"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="absolute inset-0 rounded-[24px] pointer-events-none z-20"
                style={{ boxShadow: "inset 0 0 0 2px rgba(109,40,217,0.65)" }}
              />
            )}
          </AnimatePresence>

          {/* Corner glow accents */}
          <div
            className="absolute -top-28 -left-28 size-56 rounded-full pointer-events-none"
            style={{ background: "rgba(124,58,237,0.09)", filter: "blur(48px)" }}
          />
          <div
            className="absolute -top-28 -right-28 size-56 rounded-full pointer-events-none"
            style={{ background: "rgba(6,182,212,0.055)", filter: "blur(48px)" }}
          />
          <div
            className="absolute -bottom-20 left-1/3 size-40 rounded-full pointer-events-none"
            style={{ background: "rgba(109,40,217,0.055)", filter: "blur(40px)" }}
          />

          {/* ── TitleBar — always visible at top ───────────────────────── */}
          <TitleBar
            className="pt-0.5 shrink-0"
            onShowShortcuts={() => setShowShortcuts(true)}
            onShowCommandPalette={() => setShowCommandPalette(true)}
          />

          {/* ── Scrollable content area ─────────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
          >
            {/* ── Input ────────────────────────────────────────────────── */}
            <ClipInput
              value={value}
              onChange={handleChange}
              contentType={result.type}
              analyzing={analyzing}
              onClear={handleClear}
              onUndo={handleUndo}
              canUndo={canUndo}
              onCopy={handleCopy}
            />

            {/* ── Detection bar ────────────────────────────────────────── */}
            <DetectionBar result={result} analyzing={analyzing} />

            {/* Divider */}
            {result.type !== "empty" && !showHumanize && (
              <div className="mx-5 mb-4" style={DIVIDER} />
            )}

            {/* ── Actions / Humanize ───────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {showHumanize ? (
                <motion.div
                  key="humanize"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <HumanizePanel
                    value={value}
                    contentType={result.type}
                    onApply={handleHumanizeApply}
                    onCancel={() => setShowHumanize(false)}
                  />
                </motion.div>
              ) : result.type !== "empty" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ActionGrid
                    contentType={result.type}
                    onAction={handleAction}
                    appliedAction={appliedAction}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* ── Preview ──────────────────────────────────────────────── */}
            <PreviewPanel
              original={original}
              transformed={value}
              contentType={result.type}
              historyIds={historyIds}
              onRevert={handleRevert}
              onUndo={handleUndo}
              onCopy={handleCopy}
              canUndo={canUndo}
            />
          </div>

          {/* ── Bottom bar — always visible at bottom ──────────────────── */}
          <BottomBar
            hasContent={value.trim().length > 0}
            onCopy={handleCopy}
            onPasteFromClipboard={handlePasteFromClipboard}
            onClear={handleClear}
            appliedCount={history.length}
            canUndo={canUndo}
            onUndo={handleUndo}
            onOpenSettings={() => setShowSettings(true)}
            onOpenShortcuts={() => setShowShortcuts(true)}
          />
        </motion.div>
      </div>

      {/* ── Modals (rendered outside main panel) ────────────────────────── */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal key="onboarding" onDone={handleOnboardingDone} />
        )}
      </AnimatePresence>

      <KeyboardShortcutsModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSet={setSetting}
        onReset={resetSettings}
      />

      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        contentType={result.type}
        onAction={handlePaletteAction}
      />
    </>
  );
}
