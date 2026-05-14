import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardPaste, Sparkles, X, CornerDownLeft } from "lucide-react";
import { cn } from "@utils/cn";
import { useTheme } from "@context/ThemeContext";
import type { ContentType } from "@/types";

// ─── Cycling placeholder strings ────────────────────────────────────────────

const PLACEHOLDERS = [
  "Paste anything — text, URLs, code, colors…",
  "Paste AI-generated text to clean up…",
  "Paste JSON to format or minify…",
  "Paste a URL to decode and inspect…",
  "Paste code to transform or reformat…",
  "Paste a color value to convert formats…",
  "Paste an API key to safely mask it…",
  "Paste CSV rows to sort or deduplicate…",
  "Paste Markdown to clean or export…",
];

// Contextual hint shown when content type is known
const TYPE_HINTS: Partial<Record<ContentType, string>> = {
  ai:       "AI-style text detected — strip filler phrases, extract bullets, or remove opener…",
  url:      "URL detected — decode, extract domain, or encode params…",
  json:     "JSON detected — format, minify, or validate…",
  code:     "Code detected — trim, remove blank lines, or encode…",
  color:    "Color detected — convert to RGB, HSL, or CSS variable…",
  secret:   "Secret detected — mask it before sharing…",
  markdown: "Markdown detected — clean spacing or remove blanks…",
  csv:      "CSV detected — sort rows or remove duplicates…",
  email:    "Email detected — trim and normalize…",
  number:   "Number detected — trim or encode…",
};

// ─── Per-type accent color ───────────────────────────────────────────────────

const TYPE_COLOR: Partial<Record<ContentType, string>> = {
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
  text:     "#ffffff",
};

// ─── Slot-machine animated number ────────────────────────────────────────────

function AnimCount({ n }: { n: number }) {
  const prevRef = useRef(n);

  // Compute direction BEFORE effect updates prevRef
  const dir = n > prevRef.current ? 1 : n < prevRef.current ? -1 : 0;

  useEffect(() => {
    prevRef.current = n;
  }, [n]);

  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        height: "1.25em",
        verticalAlign: "text-bottom",
        lineHeight: "1.25em",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={n}
          initial={{ y: dir >= 0 ? 14 : -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: dir >= 0 ? -14 : 14, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block" }}
          className="tabular-nums"
        >
          {n.toLocaleString()}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClipInputProps {
  value: string;
  onChange: (v: string) => void;
  contentType: ContentType;
  analyzing: boolean;
  onClear: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onCopy?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClipInput({
  value,
  onChange,
  contentType,
  analyzing,
  onClear,
  onUndo,
  canUndo,
  onCopy,
}: ClipInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [focused, setFocused] = useState(false);
  const [pasteFlash, setPasteFlash] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [justPasted, setJustPasted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef    = useRef<ReturnType<typeof setTimeout>>();
  const pasteFlashTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const justPastedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Cleanup all timers on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(typingTimerRef.current);
      clearTimeout(pasteFlashTimerRef.current);
      clearTimeout(justPastedTimerRef.current);
    };
  }, []);

  const isCode   = contentType === "code" || contentType === "json";
  const hasValue = value.length > 0;
  const accentColor = TYPE_COLOR[contentType];
  const charCount   = value.length;
  const wordCount   = hasValue ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount   = hasValue ? value.split("\n").length : 0;

  // ── Theme-aware color tokens ──────────────────────────────────────────────
  const textPrimary   = isDark ? "rgba(255,255,255,0.88)" : "rgba(20,15,40,0.88)";
  const textMuted     = isDark ? "rgba(255,255,255,0.28)" : "rgba(20,15,40,0.38)";
  const textFaint     = isDark ? "rgba(255,255,255,0.17)" : "rgba(20,15,40,0.30)";
  const surfaceInput  = isDark ? (pasteFlash ? "rgba(124,58,237,0.07)" : focused ? "rgba(255,255,255,0.038)" : "rgba(255,255,255,0.026)")
                               : (pasteFlash ? "rgba(124,58,237,0.06)" : focused ? "rgba(109,40,217,0.06)" : "rgba(109,40,217,0.03)");
  const borderSubtle  = isDark ? "rgba(255,255,255,0.07)" : "rgba(109,40,217,0.10)";
  const footerBorder  = isDark ? "rgba(255,255,255,0.05)" : "rgba(109,40,217,0.08)";
  const pillBg        = isDark ? "rgba(255,255,255,0.055)" : "rgba(109,40,217,0.07)";
  const pillBorder    = isDark ? "rgba(255,255,255,0.09)" : "rgba(109,40,217,0.12)";

  // ── Auto-resize ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "height 120ms cubic-bezier(0.16,1,0.3,1)";
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 224);
    el.style.height = `${next}px`;
  }, [value]);

  // ── Cycle placeholder ─────────────────────────────────────────────────────
  useEffect(() => {
    if (hasValue || focused) return;
    const id = setInterval(
      () => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length),
      2800
    );
    return () => clearInterval(id);
  }, [hasValue, focused]);

  // ── Paste event ───────────────────────────────────────────────────────────
  const handleNativePaste = useCallback(() => {
    setPasteFlash(true);
    setJustPasted(true);
    clearTimeout(pasteFlashTimerRef.current);
    clearTimeout(justPastedTimerRef.current);
    pasteFlashTimerRef.current = setTimeout(() => setPasteFlash(false), 550);
    justPastedTimerRef.current = setTimeout(() => setJustPasted(false), 1200);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // ── Typing shimmer trigger ────────────────────────────────────────────
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        setIsTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 600);
      }

      const ctrl = e.ctrlKey || e.metaKey;
      if ((ctrl && e.key === "k") || (e.key === "Escape" && hasValue)) {
        e.preventDefault();
        onClear();
      }
      if (ctrl && e.key === "z" && canUndo && onUndo) {
        e.preventDefault();
        onUndo();
      }
      if (ctrl && e.shiftKey && e.key === "C" && hasValue && onCopy) {
        e.preventDefault();
        onCopy();
      }
    },
    [hasValue, onClear, canUndo, onUndo, onCopy]
  );

  // ── Paste from clipboard button ───────────────────────────────────────────
  const handlePasteBtn = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
        setPasteFlash(true);
        setJustPasted(true);
        clearTimeout(pasteFlashTimerRef.current);
        clearTimeout(justPastedTimerRef.current);
        pasteFlashTimerRef.current = setTimeout(() => setPasteFlash(false), 550);
        justPastedTimerRef.current = setTimeout(() => setJustPasted(false), 1200);
      }
    } catch {
      ref.current?.focus();
    }
  };

  // ── Glow color per state ──────────────────────────────────────────────────
  const ringColor = focused
    ? accentColor
      ? `${accentColor}55`
      : "rgba(124,58,237,0.45)"
    : accentColor && hasValue
    ? `${accentColor}20`
    : "rgba(255,255,255,0.0)";

  const borderColor = focused
    ? accentColor ?? "rgba(124,58,237,0.55)"
    : accentColor && hasValue
    ? `${accentColor}35`
    : borderSubtle;

  // Placeholder to show
  const contextHint = hasValue ? TYPE_HINTS[contentType] : undefined;
  const cyclingPlaceholder = PLACEHOLDERS[placeholderIdx];

  return (
    <div className="px-5 pb-3 pt-1">

      {/* ── Main container ───────────────────────────────────────── */}
      <motion.div
        animate={{
          boxShadow: focused
            ? `0 0 0 1.5px ${borderColor}, 0 0 28px ${ringColor}, 0 6px 20px rgba(0,0,0,${isDark ? 0.35 : 0.08})`
            : hasValue
            ? `0 0 0 1px ${borderColor}, 0 2px 12px rgba(0,0,0,${isDark ? 0.25 : 0.05})`
            : `0 0 0 1px ${borderSubtle}`,
        }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: surfaceInput,
          transition: "background 0.45s ease",
        }}
      >
        {/* Static focus shimmer line */}
        <motion.div
          animate={{ opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${accentColor ?? "#7c3aed"}60 40%, ${accentColor ?? "#7c3aed"}60 60%, transparent)`,
          }}
        />

        {/* ── Typing shimmer sweep (#3) ─────────────────────────── */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px]"
          initial={{ x: "-100%" }}
          animate={isTyping && focused ? { x: ["-100%", "100%"] } : { x: "-100%" }}
          transition={{
            duration: 0.9,
            ease: "easeInOut",
            repeat: isTyping && focused ? Infinity : 0,
            repeatDelay: 0.15,
          }}
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor ?? "#7c3aed"}cc 50%, transparent 100%)`,
            filter: "blur(0.5px)",
            opacity: isTyping && focused ? 1 : 0,
            transition: "opacity 0.25s",
          }}
        />

        {/* Left accent bar */}
        <AnimatePresence>
          {accentColor && hasValue && (
            <motion.div
              key={accentColor}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full origin-center"
              style={{
                background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
                boxShadow: `0 0 10px ${accentColor}80`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Paste-burst radial flash */}
        <AnimatePresence>
          {pasteFlash && (
            <motion.div
              key="burst"
              initial={{ opacity: 0.25, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-24 rounded-full"
              style={{ background: `radial-gradient(circle, ${accentColor ?? "#7c3aed"}40, transparent 70%)` }}
            />
          )}
        </AnimatePresence>

        {/* ── Textarea area ─────────────────────────────────────── */}
        <div className={cn("relative pt-4 pb-2", hasValue ? "pl-5 pr-12" : "pl-4 pr-4")}>

          {/* Animated placeholder overlay */}
          <AnimatePresence mode="wait">
            {!hasValue && (
              <motion.p
                key={contextHint ? "hint" : placeholderIdx}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(5px)" }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none absolute left-4 top-4 right-4 text-[15px] leading-relaxed select-none"
                style={{ color: textFaint }}
              >
                {contextHint ?? cyclingPlaceholder}
              </motion.p>
            )}
          </AnimatePresence>

          {/* The textarea itself */}
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setIsTyping(false); }}
            onPaste={handleNativePaste}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            data-selectable
            className={cn(
              "relative w-full min-h-[88px] max-h-[224px] resize-none bg-transparent",
              "leading-relaxed outline-none",
              "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
              "transition-[font-family,font-size] duration-250",
              isCode
                ? "font-mono text-[13.5px] tracking-tight"
                : "font-sans text-[15px]",
              !hasValue && "caret-violet-400/50 text-transparent",
            )}
            style={{ color: hasValue ? textPrimary : "transparent" }}
          />

          {/* Top-right: sparkle / analyzing indicator */}
          <AnimatePresence>
            {hasValue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute right-3.5 top-3.5"
              >
                <motion.div
                  animate={
                    analyzing
                      ? { rotate: 360, opacity: 1 }
                      : { rotate: 0, opacity: justPasted ? 1 : 0.3 }
                  }
                  transition={
                    analyzing
                      ? { duration: 1.6, repeat: Infinity, ease: "linear" }
                      : { duration: 0.3 }
                  }
                >
                  <Sparkles
                    size={13}
                    className={analyzing ? "text-violet-400" : justPasted ? "text-violet-300" : ""}
                    style={{ color: !analyzing && !justPasted ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(109,40,217,0.35)") : undefined }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer strip ─────────────────────────────────────── */}
        <AnimatePresence>
          {hasValue && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between overflow-hidden px-4 py-2"
              style={{ borderTop: `1px solid ${footerBorder}` }}
            >
              {/* Left — stats with slot-machine counter */}
              <div className="flex items-center gap-3">
                <span className="text-[11px]" style={{ color: textMuted }}>
                  <AnimCount n={charCount} /> chars
                </span>
                {wordCount > 1 && (
                  <span className="text-[11px]" style={{ color: isDark ? "rgba(255,255,255,0.20)" : "rgba(20,15,40,0.30)" }}>
                    <AnimCount n={wordCount} /> words
                  </span>
                )}
                {lineCount > 1 && (
                  <span className="text-[11px]" style={{ color: isDark ? "rgba(255,255,255,0.18)" : "rgba(20,15,40,0.28)" }}>
                    <AnimCount n={lineCount} /> lines
                  </span>
                )}
              </div>

              {/* Right — shortcut hint + clear */}
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {focused && (
                    <motion.div
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-1"
                    >
                      <kbd
                        className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textMuted }}
                      >
                        Ctrl K
                      </kbd>
                      <span className="text-[10px]" style={{ color: textMuted }}>clear</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Clear button */}
                <motion.button
                  whileHover={{ scale: 1.12, backgroundColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(109,40,217,0.10)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClear}
                  className="no-drag flex size-[22px] items-center justify-center rounded-lg transition-colors duration-150"
                  style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textMuted }}
                  aria-label="Clear input"
                >
                  <X size={10} strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Paste button (shown below when empty) ───────────────── */}
      <AnimatePresence>
        {!hasValue && (
          <motion.button
            key="paste-cta"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            whileHover={{ opacity: 1, scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.975 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={handlePasteBtn}
            className="no-drag mt-2.5 flex w-full items-center justify-center gap-2.5 rounded-xl py-2.5"
            style={{
              background: isDark ? "rgba(255,255,255,0.033)" : "rgba(109,40,217,0.05)",
              border: `1px solid ${borderSubtle}`,
              color: isDark ? "rgba(255,255,255,0.32)" : "rgba(20,15,40,0.45)",
              opacity: 0.85,
            }}
          >
            <ClipboardPaste size={13} />
            <span className="text-[12px] font-medium">Paste from clipboard</span>
            <div className="flex items-center gap-1">
              <kbd
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textMuted }}
              >
                Ctrl+V
              </kbd>
              <span className="text-[10px]" style={{ color: textMuted }}>or click</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Type-specific contextual footer hint ────────────────── */}
      <AnimatePresence>
        {hasValue && TYPE_HINTS[contentType] && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="mt-2 flex items-center gap-2 px-1"
          >
            <CornerDownLeft size={10} style={{ color: textMuted, flexShrink: 0 }} />
            <span className="text-[11px]" style={{ color: textMuted }}>
              {TYPE_HINTS[contentType]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
