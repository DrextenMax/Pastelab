import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, ChevronRight } from "lucide-react";
import { humanize, INTENSITY_META } from "@utils/humanize";
import type { HumanizeIntensity, HumanizeChange } from "@utils/humanize";
import type { ContentType } from "@/types";
import { cn } from "@utils/cn";

// ─── Intensity slider ─────────────────────────────────────────────────────────

const STEPS: HumanizeIntensity[] = [1, 2, 3, 4, 5];

interface IntensitySliderProps {
  value: HumanizeIntensity;
  onChange: (v: HumanizeIntensity) => void;
}

function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const pct = ((value - 1) / 4) * 100;

  return (
    <div className="select-none">
      {/* Track + dots row */}
      <div className="relative flex items-center gap-0 px-1 py-3">
        {/* Background track */}
        <div
          className="absolute inset-x-1 h-[2px] rounded-full"
          style={{ background: "rgba(255,255,255,0.08)", top: "50%" }}
        />
        {/* Filled track */}
        <motion.div
          className="pointer-events-none absolute h-[2px] rounded-full"
          style={{
            left: 4,
            background: "linear-gradient(to right, rgba(167,139,250,0.6), #a78bfa)",
            top: "50%",
          }}
          animate={{ width: `calc(${pct}% - 4px)` }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        {/* Step dots */}
        {STEPS.map((step) => {
          const active = step === value;
          const filled = step <= value;
          return (
            <button
              key={step}
              onClick={() => onChange(step)}
              className={cn(
                "no-drag relative z-10 flex-1 flex justify-center items-center focus-visible:outline-none"
              )}
            >
              <motion.div
                animate={{
                  scale: active ? 1.25 : 1,
                  background: filled
                    ? active
                      ? "#a78bfa"
                      : "rgba(167,139,250,0.55)"
                    : "rgba(255,255,255,0.14)",
                  boxShadow: active ? "0 0 0 4px rgba(167,139,250,0.2)" : "none",
                }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                className="size-3 rounded-full"
              />
            </button>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex">
        {STEPS.map((step) => (
          <button
            key={step}
            onClick={() => onChange(step)}
            className="no-drag flex-1 text-center focus-visible:outline-none"
          >
            <motion.span
              animate={{
                color: step === value ? "#c4b5fd" : "rgba(255,255,255,0.25)",
                fontWeight: step === value ? 600 : 400,
              }}
              transition={{ duration: 0.15 }}
              className="text-[10px]"
            >
              {INTENSITY_META[step].label}
            </motion.span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Change chip ──────────────────────────────────────────────────────────────

interface ChangePillProps {
  change: HumanizeChange;
  delay: number;
}

function ChangePill({ change, delay }: ChangePillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -3 }}
      transition={{ duration: 0.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
      style={{
        background: "rgba(167,139,250,0.08)",
        border: "1px solid rgba(167,139,250,0.2)",
      }}
    >
      <div
        className="flex size-3.5 items-center justify-center rounded-full"
        style={{ background: "rgba(167,139,250,0.25)" }}
      >
        <Check size={8} strokeWidth={3} style={{ color: "#c4b5fd" }} />
      </div>
      <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
        {change.count} {change.label}
      </span>
    </motion.div>
  );
}

// ─── Text preview pane ────────────────────────────────────────────────────────

interface TextPaneProps {
  label: string;
  content: string;
  dim?: boolean;
  isCode?: boolean;
  animKey?: string | number;
}

function TextPane({ label, content, dim, isCode, animKey }: TextPaneProps) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${dim ? "rgba(255,255,255,0.06)" : "rgba(167,139,250,0.18)"}`,
        opacity: dim ? 0.5 : 1,
        transition: "opacity 0.2s, border-color 0.2s",
      }}
    >
      <div
        className="shrink-0 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em]"
        style={{
          borderBottom: `1px solid ${dim ? "rgba(255,255,255,0.05)" : "rgba(167,139,250,0.12)"}`,
          color: dim ? "rgba(255,255,255,0.22)" : "rgba(167,139,250,0.7)",
        }}
      >
        {label}
      </div>
      <div className="overflow-hidden p-3" style={{ maxHeight: 110 }}>
        <AnimatePresence mode="wait">
          <motion.pre
            key={animKey}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "whitespace-pre-wrap break-all text-[11.5px] leading-relaxed",
              isCode ? "font-mono" : "font-sans"
            )}
            style={{ color: dim ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.82)" }}
          >
            {content.length > 260 ? content.slice(0, 260) + "…" : content}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── HumanizePanel ────────────────────────────────────────────────────────────

interface HumanizePanelProps {
  value: string;
  contentType: ContentType;
  onApply: (result: string) => void;
  onCancel: () => void;
}

export function HumanizePanel({ value, contentType, onApply, onCancel }: HumanizePanelProps) {
  const [intensity, setIntensity] = useState<HumanizeIntensity>(3);
  const [result, setResult] = useState(() => humanize(value, 3));
  const [applyFlash, setApplyFlash] = useState(false);

  const isCode = contentType === "code" || contentType === "json";

  // Recompute on intensity change, debounced slightly
  useEffect(() => {
    const id = setTimeout(() => setResult(humanize(value, intensity)), 60);
    return () => clearTimeout(id);
  }, [value, intensity]);

  const handleApply = useCallback(() => {
    setApplyFlash(true);
    setTimeout(() => {
      onApply(result.text);
    }, 220);
  }, [result.text, onApply]);

  const changed = result.text !== value;
  const delta = result.text.length - value.length;
  const deltaLabel = delta === 0 ? "no change" : delta < 0 ? `${delta} chars` : `+${delta} chars`;
  const deltaColor = delta < 0 ? "#34d399" : delta > 0 ? "#f59e0b" : "rgba(255,255,255,0.35)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      className="px-5 pb-5"
    >
      {/* ── Separator ─────────────────────────────────────── */}
      <div
        className="mb-4 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(167,139,250,0.2) 30%, rgba(167,139,250,0.2) 70%, transparent)",
        }}
      />

      {/* ── Header ────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex size-6 items-center justify-center rounded-lg"
            style={{
              background: "rgba(167,139,250,0.15)",
              border: "1px solid rgba(167,139,250,0.28)",
            }}
          >
            <Sparkles size={11} style={{ color: "#c4b5fd" }} />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>
            Humanize Text
          </span>
        </div>

        <button
          onClick={onCancel}
          className="no-drag flex size-6 items-center justify-center rounded-lg transition-colors duration-150"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <X size={11} />
        </button>
      </div>

      {/* ── Intensity section ─────────────────────────────── */}
      <div
        className="mb-4 rounded-2xl px-4 pt-3 pb-4"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span
            className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Intensity
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={intensity}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.14 }}
              className="text-[10px]"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              {INTENSITY_META[intensity].desc}
            </motion.span>
          </AnimatePresence>
        </div>

        <IntensitySlider value={intensity} onChange={setIntensity} />
      </div>

      {/* ── Changes ───────────────────────────────────────── */}
      <AnimatePresence>
        {result.changes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 overflow-hidden"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "rgba(255,255,255,0.22)" }}
              >
                Changes
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)" }}
              />
              <span
                className="text-[10px] font-semibold tabular-nums"
                style={{ color: deltaColor }}
              >
                {deltaLabel}
              </span>
            </div>
            <AnimatePresence mode="popLayout">
              <div className="flex flex-wrap gap-1.5">
                {result.changes.map((c, i) => (
                  <ChangePill key={c.id} change={c} delay={i * 0.04} />
                ))}
              </div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Before / After preview ────────────────────────── */}
      <div className="mb-4 flex items-stretch gap-2.5">
        <TextPane
          label="Original"
          content={value}
          dim
          isCode={isCode}
        />

        <div className="flex shrink-0 items-center justify-center">
          <div
            className="flex size-6 items-center justify-center rounded-full"
            style={{
              background: "rgba(167,139,250,0.15)",
              border: "1px solid rgba(167,139,250,0.28)",
            }}
          >
            <ChevronRight size={11} style={{ color: "#a78bfa" }} />
          </div>
        </div>

        <TextPane
          label="Humanized"
          content={result.text}
          isCode={isCode}
          animKey={`${intensity}-${result.text.slice(0, 20)}`}
        />
      </div>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onCancel}
          className="no-drag flex-1 rounded-xl py-2 text-[12px] font-medium transition-all duration-150"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Cancel
        </button>

        <motion.button
          whileHover={changed ? { scale: 1.02 } : undefined}
          whileTap={changed ? { scale: 0.97 } : undefined}
          onClick={changed ? handleApply : undefined}
          animate={{
            background: applyFlash
              ? "rgba(16,185,129,0.25)"
              : changed
              ? "rgba(109,40,217,0.35)"
              : "rgba(255,255,255,0.04)",
            borderColor: applyFlash
              ? "rgba(16,185,129,0.5)"
              : changed
              ? "rgba(139,92,246,0.5)"
              : "rgba(255,255,255,0.08)",
            boxShadow: changed && !applyFlash
              ? "0 0 22px rgba(109,40,217,0.28)"
              : "none",
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "no-drag flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-[12px] font-semibold",
            !changed && "pointer-events-none"
          )}
          style={{
            border: "1px solid transparent",
            color: applyFlash ? "#6ee7b7" : changed ? "#e9d5ff" : "rgba(255,255,255,0.22)",
          }}
        >
          <Sparkles size={12} />
          <span>{applyFlash ? "Applied!" : "Apply Changes"}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
