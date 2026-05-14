import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Link,
  Code2,
  Palette,
  Braces,
  KeyRound,
  Hash,
  AtSign,
  Table2,
  FileType,
  Loader2,
  Bot,
} from "lucide-react";
import type { ContentType, DetectionResult } from "@/types";
import { useTheme } from "@context/ThemeContext";

interface TypeConfig {
  label: string;
  icon: React.ElementType;
  textColor: string;
  bg: string;
  borderColor: string;
  glowColor: string;
  dotColor: string;
  pulseDot: boolean;
}

const typeConfig: Record<ContentType, TypeConfig> = {
  empty: {
    label: "Ready",
    icon: FileText,
    textColor: "var(--t7)",
    bg: "var(--s4)",
    borderColor: "var(--b4)",
    glowColor: "transparent",
    dotColor: "var(--t8)",
    pulseDot: false,
  },
  text: {
    label: "Plain text",
    icon: FileText,
    textColor: "var(--t3)",
    bg: "var(--s3)",
    borderColor: "var(--b3)",
    glowColor: "transparent",
    dotColor: "var(--t5)",
    pulseDot: false,
  },
  ai: {
    label: "AI-style text detected",
    icon: Bot,
    textColor: "#e879f9",
    bg: "linear-gradient(135deg, rgba(232,121,249,0.13) 0%, rgba(139,92,246,0.08) 100%)",
    borderColor: "rgba(232,121,249,0.28)",
    glowColor: "rgba(216,100,239,0.14)",
    dotColor: "#d946ef",
    pulseDot: true,
  },
  url: {
    label: "URL detected",
    icon: Link,
    textColor: "#22d3ee",
    bg: "linear-gradient(135deg, rgba(6,182,212,0.14) 0%, rgba(34,211,238,0.06) 100%)",
    borderColor: "rgba(6,182,212,0.28)",
    glowColor: "rgba(6,182,212,0.1)",
    dotColor: "#06b6d4",
    pulseDot: false,
  },
  json: {
    label: "JSON detected",
    icon: Braces,
    textColor: "#fbbf24",
    bg: "linear-gradient(135deg, rgba(251,191,36,0.14) 0%, rgba(245,158,11,0.06) 100%)",
    borderColor: "rgba(251,191,36,0.28)",
    glowColor: "rgba(245,158,11,0.1)",
    dotColor: "#f59e0b",
    pulseDot: false,
  },
  code: {
    label: "Code detected",
    icon: Code2,
    textColor: "#a78bfa",
    bg: "linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(139,92,246,0.06) 100%)",
    borderColor: "rgba(167,139,250,0.28)",
    glowColor: "rgba(139,92,246,0.1)",
    dotColor: "#8b5cf6",
    pulseDot: false,
  },
  color: {
    label: "Color",
    icon: Palette,
    textColor: "#f472b6",
    bg: "linear-gradient(135deg, rgba(244,114,182,0.14) 0%, rgba(236,72,153,0.06) 100%)",
    borderColor: "rgba(244,114,182,0.28)",
    glowColor: "rgba(236,72,153,0.1)",
    dotColor: "#ec4899",
    pulseDot: false,
  },
  email: {
    label: "Email",
    icon: AtSign,
    textColor: "#60a5fa",
    bg: "linear-gradient(135deg, rgba(96,165,250,0.14) 0%, rgba(59,130,246,0.06) 100%)",
    borderColor: "rgba(96,165,250,0.28)",
    glowColor: "rgba(59,130,246,0.1)",
    dotColor: "#3b82f6",
    pulseDot: false,
  },
  csv: {
    label: "CSV data detected",
    icon: Table2,
    textColor: "#34d399",
    bg: "linear-gradient(135deg, rgba(52,211,153,0.14) 0%, rgba(16,185,129,0.06) 100%)",
    borderColor: "rgba(52,211,153,0.28)",
    glowColor: "rgba(16,185,129,0.1)",
    dotColor: "#10b981",
    pulseDot: false,
  },
  secret: {
    label: "Secret / Key",
    icon: KeyRound,
    textColor: "#f87171",
    bg: "linear-gradient(135deg, rgba(248,113,113,0.16) 0%, rgba(239,68,68,0.08) 100%)",
    borderColor: "rgba(248,113,113,0.3)",
    glowColor: "rgba(239,68,68,0.14)",
    dotColor: "#ef4444",
    pulseDot: true,
  },
  markdown: {
    label: "Markdown detected",
    icon: FileType,
    textColor: "#93c5fd",
    bg: "linear-gradient(135deg, rgba(147,197,253,0.12) 0%, rgba(96,165,250,0.05) 100%)",
    borderColor: "rgba(147,197,253,0.24)",
    glowColor: "rgba(96,165,250,0.08)",
    dotColor: "#60a5fa",
    pulseDot: false,
  },
  number: {
    label: "Number",
    icon: Hash,
    textColor: "#6ee7b7",
    bg: "linear-gradient(135deg, rgba(110,231,183,0.12) 0%, rgba(52,211,153,0.05) 100%)",
    borderColor: "rgba(110,231,183,0.22)",
    glowColor: "rgba(52,211,153,0.07)",
    dotColor: "#34d399",
    pulseDot: false,
  },
};

const badgeVariants = {
  hidden:  { opacity: 0, scale: 0.68, y: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: {
      type: "spring" as const, stiffness: 500, damping: 22, mass: 0.75,
      filter: { type: "tween" as const, duration: 0.28, ease: "easeOut" as const },
    },
  },
  exit:    { opacity: 0, scale: 0.80, y: -8, filter: "blur(5px)", transition: { duration: 0.15, ease: "easeIn" as const } },
};

interface StatPillProps {
  value: string | number;
  label: string;
}

function StatPill({ value, label }: StatPillProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="flex items-baseline gap-1 rounded-lg px-2.5 py-1"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(109,40,217,0.06)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(109,40,217,0.10)",
        transition: "background 0.4s, border-color 0.4s",
      }}
    >
      <span className="text-[13px] font-semibold tabular-nums" style={{ color: isDark ? "rgba(255,255,255,0.72)" : "rgba(20,15,40,0.72)" }}>
        {value}
      </span>
      <span className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.28)" : "rgba(20,15,40,0.40)" }}>
        {label}
      </span>
    </div>
  );
}

interface DetectionBarProps {
  result: DetectionResult;
  analyzing: boolean;
}

export function DetectionBar({ result, analyzing }: DetectionBarProps) {
  const cfg = typeConfig[result.type];
  const hasStats = result.type !== "empty";

  return (
    <div className="flex items-center gap-2.5 px-5 pb-3">

      {/* ── Type badge ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={analyzing ? "__analyzing__" : result.type}
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={{
            background: analyzing
              ? "rgba(139,92,246,0.08)"
              : cfg.bg,
            border: `1px solid ${analyzing ? "rgba(139,92,246,0.2)" : cfg.borderColor}`,
            boxShadow: analyzing ? "none" : `0 0 14px ${cfg.glowColor}`,
          }}
        >
          {analyzing ? (
            <>
              <Loader2 size={11} className="animate-spin" style={{ color: "rgba(167,139,250,0.9)" }} />
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: "rgba(167,139,250,0.9)" }}>
                Analyzing…
              </span>
            </>
          ) : (
            <>
              {/* Pulsing dot */}
              <motion.div
                animate={cfg.pulseDot ? { opacity: [1, 0.35, 1], scale: [1, 0.8, 1] } : {}}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="size-1.5 flex-shrink-0 rounded-full"
                style={{ background: cfg.dotColor, boxShadow: `0 0 5px ${cfg.dotColor}80` }}
              />

              {/* Icon */}
              <cfg.icon size={11} style={{ color: cfg.textColor, opacity: 0.85, flexShrink: 0 }} />

              {/* Label */}
              <span
                className="text-[11px] font-semibold tracking-wide whitespace-nowrap"
                style={{ color: cfg.textColor }}
              >
                {cfg.label}
              </span>

              {/* Language sub-badge for code */}
              {result.language && (
                <span
                  className="ml-0.5 rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-widest"
                  style={{
                    background: "var(--s1)",
                    color: "var(--t5)",
                  }}
                >
                  {result.language}
                </span>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Color swatch ────────────────────────────────────── */}
      <AnimatePresence>
        {result.type === "color" && !analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="size-5 rounded-md ring-1 ring-white/15"
            style={{ background: "var(--clip-color, #888)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Stats ───────────────────────────────────────────── */}
      <AnimatePresence>
        {hasStats && !analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5"
          >
            {result.charCount !== undefined && (
              <StatPill value={result.charCount} label="chars" />
            )}
            {result.wordCount !== undefined && result.wordCount > 0 && (
              <StatPill value={result.wordCount} label="words" />
            )}
            {result.lineCount !== undefined && result.lineCount > 1 && (
              <StatPill value={result.lineCount} label="lines" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
