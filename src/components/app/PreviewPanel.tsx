import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Copy, CheckCheck, Undo2,
  Columns2, FileDiff, Eye,
} from "lucide-react";
import { cn } from "@utils/cn";
import { allActionsById } from "@utils/transforms";
import { diffWords, diffStats } from "@utils/diff";
import type { DiffSegment } from "@utils/diff";
import type { ContentType } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "split" | "diff" | "result";

interface PreviewPanelProps {
  original: string;
  transformed: string;
  contentType: ContentType;
  historyIds: string[];
  onRevert: () => void;
  onUndo: () => void;
  onCopy: () => void;
  canUndo: boolean;
}

// ─── History chain ────────────────────────────────────────────────────────────

function HistoryChain({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  const visible = ids.slice(-5);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
      {visible.map((id, i) => {
        const action = allActionsById[id];
        if (!action) return null;
        const Icon = action.icon;
        return (
          <div key={`${id}-${i}`} className="flex shrink-0 items-center gap-1">
            {i > 0 && <span className="text-[10px]" style={{ color: "var(--t9)" }}>›</span>}
            <motion.div
              initial={{ opacity: 0, scale: 0.78, x: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5"
              style={{ background: "var(--s2)", border: "1px solid var(--b2)" }}
            >
              <Icon size={8} style={{ color: "var(--t5)" }} />
              <span className="whitespace-nowrap text-[9.5px] font-medium" style={{ color: "var(--t4)" }}>
                {action.label}
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

// ─── View mode toggle ─────────────────────────────────────────────────────────

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

const MODES: { id: ViewMode; icon: React.ElementType; tip: string }[] = [
  { id: "split",  icon: Columns2, tip: "Side by side" },
  { id: "diff",   icon: FileDiff, tip: "Inline diff"  },
  { id: "result", icon: Eye,      tip: "Result only"  },
];

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-xl p-1"
      style={{ background: "var(--s4)", border: "1px solid var(--b4)" }}
    >
      {MODES.map(({ id, icon: Icon, tip }) => {
        const active = mode === id;
        return (
          <motion.button
            key={id}
            title={tip}
            onClick={() => onChange(id)}
            animate={{
              background: active ? "rgba(139,92,246,0.28)" : "transparent",
              color: active ? "#c4b5fd" : "var(--t6)",
              boxShadow: active ? "0 0 10px rgba(139,92,246,0.22)" : "none",
            }}
            whileHover={!active ? { color: "var(--t3)" } : undefined}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="no-drag flex size-6 items-center justify-center rounded-lg focus-visible:outline-none"
            style={{ border: active ? "1px solid rgba(139,92,246,0.35)" : "1px solid transparent" }}
          >
            <Icon size={11} />
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={String(value)}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.14 }}
        className="flex items-baseline gap-1 rounded-lg px-2 py-0.5"
        style={{ background: "var(--s4)", border: "1px solid var(--b4)" }}
      >
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: color ?? "var(--t3)" }}>
          {value}
        </span>
        <span className="text-[9.5px]" style={{ color: "var(--t7)" }}>{label}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Pane header ─────────────────────────────────────────────────────────────

function PaneHeader({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center px-3 py-1.5"
      style={{ borderBottom: `1px solid ${accent ? "rgba(139,92,246,0.15)" : "var(--b6)"}` }}
    >
      {accent && (
        <motion.div
          className="mr-1.5 size-1.5 rounded-full"
          animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "#a78bfa", boxShadow: "0 0 5px #a78bfa80" }}
        />
      )}
      <span
        className="text-[9px] font-bold uppercase tracking-[0.14em]"
        style={{ color: accent ? "rgba(196,181,253,0.7)" : "var(--t7)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Scrollable text body ─────────────────────────────────────────────────────

function TextBody({
  children,
  isCode,
  dim,
  scrollKey,
}: {
  children: React.ReactNode;
  isCode?: boolean;
  dim?: boolean;
  scrollKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [scrollKey]);

  return (
    <div
      ref={ref}
      className="overflow-y-auto p-3"
      style={{
        maxHeight: 120,
        scrollbarWidth: "thin",
        scrollbarColor: "var(--b2) transparent",
        opacity: dim ? 0.42 : 1,
        transition: "opacity 0.25s",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.pre
          key={scrollKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "whitespace-pre-wrap break-words text-[12px] leading-relaxed",
            isCode ? "font-mono" : "font-sans"
          )}
          style={{ color: "var(--t2)" }}
        >
          {children}
        </motion.pre>
      </AnimatePresence>
    </div>
  );
}

// ─── Split view ───────────────────────────────────────────────────────────────

function SplitView({ original, transformed, contentType }: {
  original: string; transformed: string; contentType: ContentType;
}) {
  const isCode = contentType === "code" || contentType === "json";
  const isColor = contentType === "color" && /^(#[0-9a-f]{3,8}|rgb[a]?\(|hsl[a]?\()/i.test(transformed.trim());
  const truncate = (s: string, n = 300) => (s.length > n ? s.slice(0, n) + "…" : s);

  const paneBase = { background: "var(--s5)", border: "1px solid var(--b4)" } as const;
  const paneAccent = {
    background: "rgba(109,40,217,0.06)",
    border: "1px solid rgba(139,92,246,0.22)",
    boxShadow: "0 0 18px rgba(109,40,217,0.1)",
  } as const;

  return (
    <div className="flex items-stretch gap-2.5">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl" style={paneBase}>
        <PaneHeader label="Before" />
        <TextBody isCode={isCode} dim>{truncate(original)}</TextBody>
      </div>

      <div className="flex shrink-0 items-center justify-center">
        <motion.div
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-6 items-center justify-center rounded-full"
          style={{ background: "rgba(109,40,217,0.18)", border: "1px solid rgba(139,92,246,0.3)" }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 5.5h7M6.5 3 9 5.5 6.5 8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl" style={paneAccent}>
        <PaneHeader label="After" accent />
        {isColor ? (
          <div className="flex items-center gap-2.5 p-3">
            <div className="size-8 rounded-lg ring-1 ring-white/15" style={{ background: transformed.trim() }} />
            <code className="font-mono text-[13px]" style={{ color: "var(--t1)" }}>
              {transformed.trim()}
            </code>
          </div>
        ) : (
          <TextBody isCode={isCode} scrollKey={transformed.slice(0, 30)}>{truncate(transformed)}</TextBody>
        )}
      </div>
    </div>
  );
}

// ─── Diff view ────────────────────────────────────────────────────────────────

function DiffSegmentSpan({ seg, changeIndex }: { seg: DiffSegment; changeIndex: number }) {
  if (seg.type === "equal") return <span>{seg.text}</span>;
  const isIns = seg.type === "insert";
  const delay = Math.min(changeIndex * 0.05, 0.5);
  return (
    <motion.mark
      initial={{ opacity: 0, y: isIns ? 4 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("inline-block rounded-sm px-0.5 py-px", isIns ? "" : "line-through")}
      style={{
        background: isIns ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.12)",
        color: isIns ? "#6ee7b7" : "#fca5a5",
        textDecorationColor: isIns ? undefined : "rgba(239,68,68,0.5)",
        fontStyle: "inherit",
      }}
    >
      {seg.text}
    </motion.mark>
  );
}

function DiffView({ segments, isCode, diffKey }: { segments: DiffSegment[]; isCode: boolean; diffKey: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mark = el.querySelector<HTMLElement>("mark");
    if (mark) el.scrollTo({ top: Math.max(0, mark.offsetTop - 12), behavior: "smooth" });
  }, [diffKey]);

  let changeIdx = 0;
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: "var(--s5)", border: "1px solid var(--b4)" }}>
      <PaneHeader label="Inline diff" />
      <div ref={ref} className="overflow-y-auto p-3" style={{ maxHeight: 150, scrollbarWidth: "thin", scrollbarColor: "var(--b2) transparent" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={diffKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn("whitespace-pre-wrap break-words text-[12px] leading-relaxed", isCode ? "font-mono" : "font-sans")}
            style={{ color: "var(--t2)" }}
          >
            {segments.map((seg, i) => {
              const ci = seg.type !== "equal" ? changeIdx++ : -1;
              return <DiffSegmentSpan key={i} seg={seg} changeIndex={ci} />;
            })}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3 px-3 py-1.5" style={{ borderTop: "1px solid var(--b6)" }}>
        <div className="flex items-center gap-1">
          <div className="size-2 rounded-sm" style={{ background: "rgba(52,211,153,0.25)" }} />
          <span className="text-[9px]" style={{ color: "var(--t7)" }}>Added</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-2 rounded-sm" style={{ background: "rgba(239,68,68,0.2)" }} />
          <span className="text-[9px]" style={{ color: "var(--t7)" }}>Removed</span>
        </div>
      </div>
    </div>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────

function ResultView({ content, contentType, onCopy, copied }: {
  content: string; contentType: ContentType; onCopy: () => void; copied: boolean;
}) {
  const isCode = contentType === "code" || contentType === "json";
  const isColor = contentType === "color" && /^(#[0-9a-f]{3,8}|rgb[a]?\(|hsl[a]?\()/i.test(content.trim());

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "linear-gradient(135deg, rgba(109,40,217,0.08) 0%, var(--s6) 100%)",
        border: "1px solid rgba(139,92,246,0.22)",
        boxShadow: "0 0 24px rgba(109,40,217,0.08)",
      }}
    >
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="size-1.5 rounded-full"
            animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "#a78bfa", boxShadow: "0 0 5px #a78bfa80" }}
          />
          <span className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(196,181,253,0.7)" }}>
            Result
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={onCopy}
          className="no-drag flex items-center gap-1.5 rounded-lg px-2 py-0.5"
          style={{
            background: copied ? "rgba(16,185,129,0.12)" : "rgba(139,92,246,0.12)",
            border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(139,92,246,0.28)"}`,
            color: copied ? "#6ee7b7" : "#c4b5fd",
            transition: "background 0.2s, border-color 0.2s, color 0.2s",
          }}
        >
          {copied ? <CheckCheck size={9} /> : <Copy size={9} />}
          <span className="text-[9.5px] font-medium">{copied ? "Copied!" : "Copy"}</span>
        </motion.button>
      </div>

      <div className="overflow-y-auto p-3" style={{ maxHeight: 160, scrollbarWidth: "thin", scrollbarColor: "var(--b2) transparent" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={content.slice(0, 40)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {isColor ? (
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl ring-1 ring-white/15" style={{ background: content.trim() }} />
                <code className="font-mono text-[14px]" style={{ color: "var(--t1)" }}>{content.trim()}</code>
              </div>
            ) : (
              <pre
                className={cn("whitespace-pre-wrap break-words text-[13px] leading-relaxed", isCode ? "font-mono" : "font-sans")}
                style={{ color: "var(--t1)" }}
              >
                {content.length > 500 ? content.slice(0, 500) + "…" : content}
              </pre>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Mode transition wrapper ──────────────────────────────────────────────────

const modeVariants = {
  enter:   { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -6, scale: 0.98 },
};

// ─── PreviewPanel ─────────────────────────────────────────────────────────────

export function PreviewPanel({
  original, transformed, contentType, historyIds, onRevert, onUndo, onCopy, canUndo,
}: PreviewPanelProps) {
  const [mode, setMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState(false);

  const hasChange = original !== transformed && transformed.trim().length > 0;
  const isCode = contentType === "code" || contentType === "json";

  const segments = useMemo(() => diffWords(original, transformed), [original, transformed]);
  const stats = useMemo(() => diffStats(original, transformed, segments), [original, transformed, segments]);
  const diffKey = transformed.slice(0, 40) + transformed.length;

  const charColor = stats.charDelta < 0 ? "#34d399" : stats.charDelta > 0 ? "#f59e0b" : "var(--t5)";
  const wordColor = stats.wordDelta < 0 ? "#34d399" : stats.wordDelta > 0 ? "#f59e0b" : "var(--t5)";

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {hasChange && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5">
            {/* Separator */}
            <div
              className="mb-3.5 h-px"
              style={{ background: "linear-gradient(to right, transparent, rgba(139,92,246,0.18) 25%, var(--b3) 50%, rgba(139,92,246,0.18) 75%, transparent)" }}
            />

            {/* Header */}
            <div className="mb-3 flex items-center gap-2">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.13em]" style={{ color: "var(--t7)" }}>
                Preview
              </span>

              <HistoryChain ids={historyIds} />

              <div className="flex shrink-0 items-center gap-1.5">
                <ModeToggle mode={mode} onChange={setMode} />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={onRevert}
                  className="no-drag flex items-center gap-1 rounded-lg px-2 py-1"
                  style={{ background: "var(--s4)", border: "1px solid var(--b3)", color: "var(--t5)" }}
                >
                  <RotateCcw size={9} />
                  <span className="text-[10px] font-medium">Revert</span>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                variants={modeVariants}
                initial="enter"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {mode === "split" && <SplitView original={original} transformed={transformed} contentType={contentType} />}
                {mode === "diff"  && <DiffView segments={segments} isCode={isCode} diffKey={diffKey} />}
                {mode === "result" && <ResultView content={transformed} contentType={contentType} onCopy={handleCopy} copied={copied} />}
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StatChip value={stats.charDelta >= 0 ? `+${stats.charDelta}` : stats.charDelta} label="chars" color={charColor} />
                {stats.wordDelta !== 0 && (
                  <StatChip value={stats.wordDelta > 0 ? `+${stats.wordDelta}` : stats.wordDelta} label="words" color={wordColor} />
                )}
                {(stats.insertions > 0 || stats.deletions > 0) && mode !== "diff" && (
                  <motion.button
                    onClick={() => setMode("diff")}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    className="no-drag flex items-center gap-1 rounded-lg px-2 py-0.5"
                    style={{ background: "var(--s6)", border: "1px solid var(--b4)", color: "var(--t7)" }}
                  >
                    <FileDiff size={9} />
                    <span className="text-[9.5px]">
                      {stats.insertions + stats.deletions} change{stats.insertions + stats.deletions !== 1 ? "s" : ""}
                    </span>
                  </motion.button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <AnimatePresence>
                  {canUndo && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.18 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onUndo}
                      className="no-drag flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                      style={{ background: "var(--s4)", border: "1px solid var(--b3)", color: "var(--t5)" }}
                    >
                      <Undo2 size={10} />
                      <span className="text-[10px] font-medium">Undo</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {mode !== "result" && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={handleCopy}
                    className="no-drag flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                    style={{
                      background: copied ? "rgba(16,185,129,0.1)" : "rgba(139,92,246,0.1)",
                      border: `1px solid ${copied ? "rgba(16,185,129,0.28)" : "rgba(139,92,246,0.24)"}`,
                      color: copied ? "#6ee7b7" : "#c4b5fd",
                      transition: "background 0.2s, border-color 0.2s, color 0.2s",
                    }}
                  >
                    {copied ? <CheckCheck size={10} /> : <Copy size={10} />}
                    <span className="text-[10px] font-medium">{copied ? "Copied!" : "Copy result"}</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
