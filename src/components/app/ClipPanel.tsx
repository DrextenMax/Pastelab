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
import { useTheme } from "@context/ThemeContext";
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

function getPanelStyle(isDark: boolean): React.CSSProperties {
  if (isDark) {
    return {
      background: "rgba(9, 9, 21, 0.92)",
      backdropFilter: "blur(32px) saturate(1.4) brightness(1.06)",
      WebkitBackdropFilter: "blur(32px) saturate(1.4) brightness(1.06)",
      boxShadow: [
        "0 20px 70px rgba(109,40,217,0.28)",
        "0 8px 32px rgba(6,182,212,0.12)",
        "0 48px 120px rgba(0,0,0,0.75)",
        "inset 0 0 60px rgba(109,40,217,0.055)",
        "inset 0 0 120px rgba(6,182,212,0.028)",
        "inset 0 1px 0 rgba(255,255,255,0.10)",
      ].join(", "),
      transition: "background 0.5s, box-shadow 0.5s",
    };
  }
  return {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(32px) saturate(1.3) brightness(1.04)",
    WebkitBackdropFilter: "blur(32px) saturate(1.3) brightness(1.04)",
    boxShadow: [
      "0 20px 70px rgba(109,40,217,0.14)",
      "0 8px 32px rgba(6,182,212,0.07)",
      "0 48px 120px rgba(0,0,0,0.10)",
      "inset 0 0 60px rgba(109,40,217,0.028)",
      "inset 0 1px 0 rgba(255,255,255,0.95)",
    ].join(", "),
    transition: "background 0.5s, box-shadow 0.5s",
  };
}

function getDivider(isDark: boolean): React.CSSProperties {
  return {
    height: "1px",
    background: isDark
      ? "linear-gradient(to right, transparent, rgba(255,255,255,0.065) 20%, rgba(255,255,255,0.065) 80%, transparent)"
      : "linear-gradient(to right, transparent, rgba(109,40,217,0.12) 20%, rgba(109,40,217,0.12) 80%, transparent)",
  };
}

// ── Session autosave ──────────────────────────────────────────────────────────

const SESSION_KEY = "pastelab:session-v1";

// ── Type flash accent colours ─────────────────────────────────────────────────

const TYPE_FLASH_COLOR: Record<string, string> = {
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
  const [focusMode, setFocusMode] = useState(false);
  const [typeFlashColor, setTypeFlashColor] = useState<string | null>(null);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const { result, analyzing } = useDetection(value);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { settings, set: setSetting, reset: resetSettings } = useSettings();
  const { push: pushHistory } = useClipboardHistory();

  // Refs
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const prevDetectedType = useRef<string>("empty");

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
      const raw = value.trim();
      // Validate format before injecting into CSS to prevent rendering issues
      const isValidColor = /^(#[0-9a-f]{3,8}|rgba?\([^)]{0,80}\)|hsla?\([^)]{0,80}\)|[a-z]{2,30})$/i.test(raw);
      if (isValidColor) {
        document.documentElement.style.setProperty("--clip-color", raw);
      }
    }
  }, [result.type, value]);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────
  const paletteOpenRef = useRef(false);
  paletteOpenRef.current = showCommandPalette;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      // Ctrl+K → command palette
      if (ctrl && !e.shiftKey && e.key === "k") {
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
      // Ctrl+Shift+F → focus mode
      if (ctrl && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setFocusMode((v) => !v);
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

  // ── Session autosave: restore on mount ────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        "v" in parsed &&
        typeof (parsed as Record<string, unknown>).v === "string"
      ) {
        const v = (parsed as Record<string, unknown>).v as string;
        if (v.trim()) {
          setValue(v);
          setOriginal(v);
          flash();
        }
      }
    } catch { /* ignore corrupt / non-JSON data */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Session autosave: persist on change ──────────────────────────────────
  useEffect(() => {
    const snapshot = value; // capture for closure — avoids any stale-ref edge case
    clearTimeout(saveTimerRef.current);
    if (!snapshot.trim()) {
      try { localStorage.removeItem(SESSION_KEY); } catch {}
      return; // no timer to clean up
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ v: snapshot, ts: Date.now() }));
      } catch { /* storage full / private mode */ }
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [value]);

  // ── Type flash: glow border when detected type changes ───────────────────
  useEffect(() => {
    if (analyzing || result.type === "empty" || result.type === "text") {
      if (!analyzing) prevDetectedType.current = result.type;
      return;
    }
    if (result.type === prevDetectedType.current) return;
    const color = TYPE_FLASH_COLOR[result.type];
    prevDetectedType.current = result.type;
    if (!color) return;
    setTypeFlashColor(color);
    const t = setTimeout(() => setTypeFlashColor(null), 1100);
    return () => clearTimeout(t);
  }, [result.type, analyzing]);

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
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  };

  // ── Command palette action ────────────────────────────────────────────────
  const handlePaletteAction = useCallback((id: string) => {
    handleAction(id);
  }, [handleAction]);

  const canUndo = history.length > 0;
  const historyIds = history.map((h) => h.actionId);

  // ── Focus mode collapse motion props ─────────────────────────────────────
  const collapseMotion = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit:    { opacity: 0, height: 0 },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <>
      {/* ── Main panel ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 flex items-center justify-center" style={{ padding: 50 }}>
        <div className="relative w-full flex flex-col items-center">

        {/* ── Gradient border wrapper ────────────────────────────── */}
        <div
          className="w-full"
          style={{
            padding: "1px",
            borderRadius: "21px",
            background: isDark
              ? "linear-gradient(135deg, rgba(109,40,217,0.7) 0%, rgba(139,92,246,0.45) 25%, rgba(6,182,212,0.6) 55%, rgba(109,40,217,0.55) 85%, rgba(139,92,246,0.4) 100%)"
              : "linear-gradient(135deg, rgba(109,40,217,0.45) 0%, rgba(139,92,246,0.30) 25%, rgba(6,182,212,0.40) 55%, rgba(109,40,217,0.38) 85%, rgba(139,92,246,0.28) 100%)",
            transition: "background 0.5s",
          }}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.06 }}
          className="relative flex flex-col w-full overflow-hidden rounded-[20px]"
          style={{
            ...getPanelStyle(isDark),
            maxHeight: focusMode ? "none" : "calc(100vh - 100px)",
          }}
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

          {/* Type-change flash ring */}
          <AnimatePresence>
            {typeFlashColor && (
              <motion.div
                key={`type-flash-${result.type}`}
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute inset-0 rounded-[24px] pointer-events-none z-20"
                style={{
                  boxShadow: `inset 0 0 0 2px ${typeFlashColor}99, 0 0 0 1px ${typeFlashColor}33`,
                }}
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
            focusMode={focusMode}
            onToggleFocus={() => setFocusMode((v) => !v)}
          />

          {/* ── Scrollable content area ─────────────────────────────────── */}
          <div
            className={focusMode ? "overflow-hidden" : "flex-1 overflow-y-auto"}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: isDark
                ? "rgba(255,255,255,0.08) transparent"
                : "rgba(109,40,217,0.18) transparent",
            }}
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

            {/* ── Actions / Humanize / Preview (hidden in focus mode) ──── */}
            <AnimatePresence>
              {!focusMode && (
                <motion.div key="non-focus" {...collapseMotion} className="overflow-hidden">
                  {/* Divider */}
                  {result.type !== "empty" && !showHumanize && (
                    <div className="mx-5 mb-4" style={getDivider(isDark)} />
                  )}

                  {/* ── Actions / Humanize ─────────────────────────────── */}
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

                  {/* ── Preview ────────────────────────────────────────── */}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Bottom bar (hidden in focus mode) ──────────────────────── */}
          <AnimatePresence>
            {!focusMode && (
              <motion.div key="bottombar" {...collapseMotion} className="overflow-hidden shrink-0">
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
            )}
          </AnimatePresence>
        </motion.div>
        </div>{/* end gradient border wrapper */}

        {/* ── Reflection (item 8) ───────────────────────────────── */}
        <div
          style={{
            width: "88%",
            height: "32px",
            marginTop: "2px",
            background: "linear-gradient(to bottom, rgba(109,40,217,0.18) 0%, rgba(6,182,212,0.08) 50%, transparent 100%)",
            filter: "blur(10px)",
            borderRadius: "0 0 20px 20px",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
            transform: "scaleY(-1)",
            pointerEvents: "none",
          }}
        />

        </div>{/* end relative wrapper */}
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
