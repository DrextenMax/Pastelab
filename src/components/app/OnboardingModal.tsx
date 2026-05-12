// ─── Onboarding modal ─────────────────────────────────────────────────────────
// Shows on first launch. 3 animated steps.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, ClipboardPaste, Zap, Sparkles, ArrowRight, X, Keyboard,
  Bot, Code2, Link, Palette,
} from "lucide-react";

interface Step {
  icon: React.ElementType;
  iconGlow: string;
  iconBg: string;
  badge?: string;
  title: string;
  subtitle: string;
  features: { icon: React.ElementType; text: string; color: string }[];
}

const STEPS: Step[] = [
  {
    icon: FlaskConical,
    iconGlow: "rgba(109,40,217,0.5)",
    iconBg: "linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(109,40,217,0.6) 100%)",
    badge: "Welcome",
    title: "Meet PasteLab",
    subtitle: "Paste anything. Improve everything.",
    features: [
      { icon: ClipboardPaste, text: "Paste anything: text, code, URLs, colors", color: "#a78bfa" },
      { icon: Zap,            text: "Instant content detection, zero config",   color: "#06b6d4" },
      { icon: Sparkles,       text: "One-click transforms — no typing needed",  color: "#f59e0b" },
    ],
  },
  {
    icon: Bot,
    iconGlow: "rgba(217,70,239,0.45)",
    iconBg: "linear-gradient(135deg, rgba(232,121,249,0.35) 0%, rgba(168,85,247,0.5) 100%)",
    badge: "Smart Detection",
    title: "Understands your content",
    subtitle: "PasteLab identifies 12 content types and surfaces exactly the right tools.",
    features: [
      { icon: Bot,     text: "AI-style text → strip filler, extract bullets",  color: "#d946ef" },
      { icon: Code2,   text: "Code & JSON → format, minify, sanitize",         color: "#8b5cf6" },
      { icon: Link,    text: "URLs → decode, extract domain, encode params",   color: "#06b6d4" },
      { icon: Palette, text: "Colors → convert between RGB, HSL, CSS vars",   color: "#ec4899" },
    ],
  },
  {
    icon: Keyboard,
    iconGlow: "rgba(6,182,212,0.4)",
    iconBg: "linear-gradient(135deg, rgba(34,211,238,0.3) 0%, rgba(6,182,212,0.5) 100%)",
    badge: "Power User",
    title: "Built for keyboard speed",
    subtitle: "Every action is one shortcut away. Your hands never leave the keys.",
    features: [
      { icon: Zap, text: "Ctrl+Shift+V — quick open from anywhere",     color: "#06b6d4" },
      { icon: Zap, text: "Ctrl+Shift+C — copy result to clipboard",     color: "#34d399" },
      { icon: Zap, text: "Ctrl+K — command palette for all actions",     color: "#a78bfa" },
      { icon: Zap, text: "Ctrl+Z — undo any transform instantly",       color: "#f59e0b" },
    ],
  },
];

// ── Step content ─────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 32, scale: 0.97 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -28, scale: 0.97 }),
};

interface OnboardingModalProps {
  onDone: () => void;
}

export function OnboardingModal({ onDone }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const s = STEPS[step];
  const StepIcon = s.icon;
  const isLast = step === STEPS.length - 1;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const advance = () => {
    if (isLast) { onDone(); return; }
    go(step + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)" }}
    >
      {/* ── Modal card ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative w-full max-w-[440px] overflow-hidden rounded-[26px]"
        style={{
          background: "rgba(9,9,20,0.97)",
          border: "1px solid rgba(255,255,255,0.085)",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Top gradient strip */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(139,92,246,0.6) 35%, rgba(6,182,212,0.4) 65%, transparent)",
          }}
        />

        {/* Skip */}
        <button
          onClick={onDone}
          className="no-drag absolute right-4 top-4 flex items-center justify-center size-7 rounded-full transition-colors duration-150"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <X size={12} strokeWidth={2.5} />
        </button>

        <div className="px-8 pb-8 pt-8">
          {/* ── Icon hero ────────────────────────────────── */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-4 rounded-full"
                style={{ background: s.iconGlow, filter: "blur(20px)" }}
              />
              <motion.div
                key={step}
                initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.08 }}
                className="relative flex size-[68px] items-center justify-center rounded-[20px]"
                style={{
                  background: s.iconBg,
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: `0 8px 32px ${s.iconGlow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
                }}
              >
                <StepIcon size={28} className="text-white" strokeWidth={2} />
              </motion.div>
            </div>
          </div>

          {/* ── Step content ──────────────────────────────── */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {s.badge && (
                <div className="mb-3 flex justify-center">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "rgba(167,139,250,0.85)",
                    }}
                  >
                    {s.badge}
                  </span>
                </div>
              )}

              <h2
                className="mb-2 text-center text-[22px] font-bold tracking-tight"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                {s.title}
              </h2>
              <p
                className="mb-6 text-center text-[14px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {s.subtitle}
              </p>

              {/* Feature list */}
              <div className="space-y-2.5">
                {s.features.map((f, i) => {
                  const FIcon = f.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.065)",
                      }}
                    >
                      <div
                        className="flex size-6 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                      >
                        <FIcon size={12} style={{ color: f.color }} strokeWidth={2} />
                      </div>
                      <span className="text-[12.5px] font-medium" style={{ color: "rgba(255,255,255,0.72)" }}>
                        {f.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Progress dots ─────────────────────────────── */}
          <div className="mt-7 flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => go(i)}
                animate={{
                  width: i === step ? 20 : 6,
                  background: i === step ? "rgba(139,92,246,0.9)" : "rgba(255,255,255,0.18)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="no-drag h-1.5 rounded-full focus-visible:outline-none"
              />
            ))}
          </div>

          {/* ── Navigation ────────────────────────────────── */}
          <div className="mt-5 flex items-center gap-2.5">
            {step > 0 && (
              <button
                onClick={() => go(step - 1)}
                className="no-drag flex-1 rounded-2xl py-3 text-[13px] font-semibold transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Back
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(109,40,217,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={advance}
              className="no-drag flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(109,40,217,0.95) 100%)",
                border: "1px solid rgba(139,92,246,0.5)",
                color: "#fff",
                boxShadow: "0 0 20px rgba(109,40,217,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span>{isLast ? "Start using PasteLab" : "Continue"}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
