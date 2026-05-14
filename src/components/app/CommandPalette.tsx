// ─── Command palette ─────────────────────────────────────────────────────────
// Raycast-style: opens with ⌘K, fuzzy-searches all PasteLab actions,
// keyboard-navigated, executes on Enter.

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { allActionsById, actionsByType } from "@utils/transforms";
import type { ContentType, ClipAction } from "@/types";
import { useTheme } from "@context/ThemeContext";

// ── Type accent colours ──────────────────────────────────────────────────────

const TYPE_ACCENT: Partial<Record<ContentType, string>> = {
  text:     "#a78bfa",
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

// ── Recent commands (localStorage ring buffer) ───────────────────────────────

const RECENTS_KEY = "pastelab:recent-cmds";
const MAX_RECENTS = 5;

function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]") as string[]; }
  catch { return []; }
}
function pushRecent(id: string) {
  const list = [id, ...loadRecents().filter((r) => r !== id)].slice(0, MAX_RECENTS);
  try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)); } catch {}
}

// ── Fuzzy match ──────────────────────────────────────────────────────────────

function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return q.length / t.length + 1;
  let qi = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { score += 1 / (i + 1); qi++; }
  }
  return qi === q.length ? score : 0;
}

// ── Item row ─────────────────────────────────────────────────────────────────

interface ItemProps {
  action: ClipAction;
  contentType: ContentType;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
  showTag?: string;
  isDark: boolean;
}

function PaletteItem({ action, contentType, isActive, onSelect, onHover, showTag, isDark }: ItemProps) {
  const Icon = action.icon;
  const accent = TYPE_ACCENT[contentType] ?? "#8b5cf6";

  return (
    <motion.button
      layout
      onMouseEnter={onHover}
      onClick={onSelect}
      className="no-drag group relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 focus-visible:outline-none"
      style={{
        background: isActive ? "rgba(139,92,246,0.12)" : "transparent",
        borderRadius: 12,
      }}
    >
      {/* Active indicator bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="active-bar"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full origin-center"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-xl transition-all duration-150"
        style={{
          background: isActive ? `${accent}18` : "var(--s3)",
          border: `1px solid ${isActive ? `${accent}30` : "var(--b3)"}`,
        }}
      >
        <Icon
          size={14}
          strokeWidth={2}
          style={{
            color: isActive ? accent : "var(--t4)",
            transition: "color 0.15s",
          }}
        />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[13px] font-semibold leading-tight"
            style={{
              color: isActive
                ? (isDark ? "rgba(255,255,255,0.95)" : "rgba(20,15,40,0.95)")
                : "var(--t2)",
            }}
          >
            {action.label}
          </span>
          {showTag && (
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
              style={{
                background: "var(--s3)",
                border: "1px solid var(--b3)",
                color: "var(--t6)",
              }}
            >
              {showTag}
            </span>
          )}
        </div>
        {action.description && (
          <p className="mt-0.5 truncate text-[11px]" style={{ color: "var(--t6)" }}>
            {action.description}
          </p>
        )}
      </div>

      {/* Shortcut + arrow */}
      <div className="flex shrink-0 items-center gap-2">
        {action.shortcut && (
          <kbd
            className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
            style={{
              background: "var(--s3)",
              border: "1px solid var(--b3)",
              color: isActive ? accent : "var(--t6)",
              transition: "color 0.15s",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {action.shortcut}
          </kbd>
        )}
        <motion.span
          animate={{ opacity: isActive ? 0.7 : 0, x: isActive ? 0 : -4 }}
          transition={{ duration: 0.14 }}
          style={{ color: accent, fontSize: 13 }}
        >
          <ArrowRight size={13} />
        </motion.span>
      </div>
    </motion.button>
  );
}

// ── Group header ─────────────────────────────────────────────────────────────

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="mb-0.5 mt-3 flex items-center gap-2 px-3 first:mt-0">
      <span
        className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
        style={{ color: "var(--t7)" }}
      >
        {label}
      </span>
      <div
        className="h-px flex-1"
        style={{ background: "linear-gradient(to right, var(--b4), transparent)" }}
      />
    </div>
  );
}

// ── Command palette ───────────────────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  contentType: ContentType;
  onAction: (actionId: string) => void;
}

interface PaletteEntry {
  action: ClipAction;
  contentType: ContentType;
  tag?: string;
}

export function CommandPalette({ open, onClose, contentType, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const panelBg     = isDark ? "rgba(9,9,20,0.98)"      : "rgba(248,246,255,0.98)";
  const panelBorder = isDark ? "rgba(255,255,255,0.09)" : "rgba(109,40,217,0.18)";
  const panelShadow = isDark
    ? "0 32px 80px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 32px 80px rgba(109,40,217,0.14), 0 0 0 0.5px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.8)";

  // ── Build full action list ───────────────────────────────────────────────────
  const allEntries = useMemo<PaletteEntry[]>(() => {
    const entries: PaletteEntry[] = [];
    const current = actionsByType[contentType] ?? [];
    for (const a of current) entries.push({ action: a, contentType, tag: contentType !== "empty" ? contentType : undefined });
    const seen = new Set(current.map((a) => a.id));
    for (const [type, actions] of Object.entries(actionsByType)) {
      if (type === contentType || type === "empty") continue;
      for (const a of actions) {
        if (!seen.has(a.id)) {
          entries.push({ action: a, contentType: type as ContentType, tag: type });
          seen.add(a.id);
        }
      }
    }
    return entries;
  }, [contentType]);

  // ── Filtered + ranked results ────────────────────────────────────────────────
  const filtered = useMemo<PaletteEntry[]>(() => {
    if (!query.trim()) {
      const recents = loadRecents();
      const recentEntries = recents
        .map((id) => {
          const a = allActionsById[id];
          if (!a) return null;
          return { action: a, contentType, tag: "recent" };
        })
        .filter(Boolean) as PaletteEntry[];
      return [...recentEntries, ...allEntries.slice(0, 8)].slice(0, 12);
    }
    return allEntries
      .map((e) => ({
        entry: e,
        score: Math.max(fuzzyScore(query, e.action.label), fuzzyScore(query, e.action.description ?? "")),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => r.entry);
  }, [query, allEntries]);

  // ── Focus input on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const entry = filtered[activeIdx];
        if (entry) execAction(entry.action.id);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, activeIdx, onClose]
  );

  const execAction = (id: string) => {
    pushRecent(id);
    onAction(id);
    onClose();
  };

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[activeIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const showingRecents = !query.trim() && loadRecents().length > 0;
  const currentTypeResults = filtered.filter((e) => e.tag === contentType || e.tag === "recent" || !e.tag);
  const otherResults = filtered.filter((e) => e.tag && e.tag !== contentType && e.tag !== "recent");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] overflow-hidden rounded-[20px]"
            style={{
              background: panelBg,
              border: `1px solid ${panelBorder}`,
              boxShadow: panelShadow,
              transition: "background 0.4s, border-color 0.4s",
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(139,92,246,0.6) 35%, rgba(6,182,212,0.35) 65%, transparent)",
              }}
            />

            {/* ── Search bar ────────────────────────────────── */}
            <div
              className="relative flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: "1px solid var(--b5)" }}
            >
              <Search size={16} style={{ color: "var(--t6)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search actions…"
                spellCheck={false}
                className="flex-1 bg-transparent text-[14px] font-medium outline-none"
                style={{ color: "var(--t1)" }}
              />
              <AnimatePresence>
                {!query && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute left-[48px] text-[14px]"
                    style={{ color: "var(--t7)" }}
                  >
                    Search actions…
                  </motion.span>
                )}
              </AnimatePresence>

              <kbd
                className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                style={{
                  background: "var(--s4)",
                  border: "1px solid var(--b3)",
                  color: "var(--t7)",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                Esc
              </kbd>
            </div>

            {/* ── Results list ──────────────────────────────── */}
            <div
              ref={listRef}
              className="overflow-y-auto px-2 py-2"
              style={{
                maxHeight: 380,
                scrollbarWidth: "thin",
                scrollbarColor: "var(--b2) transparent",
              }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-3 py-10"
                  >
                    <div
                      className="flex size-11 items-center justify-center rounded-2xl"
                      style={{ background: "var(--s4)", border: "1px solid var(--b4)" }}
                    >
                      <Search size={18} style={{ color: "var(--t6)" }} />
                    </div>
                    <p className="text-[13px]" style={{ color: "var(--t5)" }}>
                      No actions match "{query}"
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {showingRecents && currentTypeResults.some((e) => e.tag === "recent") && (
                      <GroupLabel label="Recent" />
                    )}

                    {currentTypeResults.map((entry, i) => (
                      <PaletteItem
                        key={`${entry.action.id}-${i}`}
                        action={entry.action}
                        contentType={entry.tag === "recent" ? contentType : (entry.contentType as ContentType)}
                        isActive={i === activeIdx}
                        onSelect={() => execAction(entry.action.id)}
                        onHover={() => setActiveIdx(i)}
                        isDark={isDark}
                      />
                    ))}

                    {otherResults.length > 0 && (
                      <>
                        <GroupLabel label="Other actions" />
                        {otherResults.map((entry, i) => {
                          const globalIdx = currentTypeResults.length + i;
                          return (
                            <PaletteItem
                              key={`${entry.action.id}-other-${i}`}
                              action={entry.action}
                              contentType={entry.contentType as ContentType}
                              isActive={globalIdx === activeIdx}
                              onSelect={() => execAction(entry.action.id)}
                              onHover={() => setActiveIdx(globalIdx)}
                              showTag={entry.tag}
                              isDark={isDark}
                            />
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: "1px solid var(--b5)" }}
            >
              <div className="flex items-center gap-3">
                {[["↑", "↓", "navigate"], ["↵", "select"]].map(([...parts], i) => (
                  <div key={i} className="flex items-center gap-1">
                    {parts.slice(0, -1).map((k) => (
                      <kbd key={k} className="rounded px-1 py-0.5 text-[9px] font-bold" style={{ background: "var(--s3)", border: "1px solid var(--b3)", color: "var(--t6)", fontFamily: "monospace" }}>{k}</kbd>
                    ))}
                    <span className="text-[10px]" style={{ color: "var(--t7)" }}>{parts[parts.length - 1]}</span>
                  </div>
                ))}
              </div>
              <span className="text-[10px]" style={{ color: "var(--t7)" }}>
                {filtered.length} action{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
