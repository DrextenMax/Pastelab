// ─── Clipboard history ───────────────────────────────────────────────────────
// localStorage-backed list of recent clipboard entries.
// • Max MAX_ENTRIES items (oldest pruned)
// • Dedup: pushing a duplicate moves the entry to the top instead of inserting
// • Each entry stamped with a timestamp for display

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "pastelab:history";
const MAX_ENTRIES = 50;

export interface ClipHistoryEntry {
  id: string;         // nanoid-style unique key
  text: string;
  ts: number;         // Date.now()
}

// ── Tiny ID generator ────────────────────────────────────────────────────────
function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ── Secret patterns — entries matching these are never stored ────────────────
const SECRET_RE = /^(sk-|pk-|Bearer\s|ghp_|glpat-|AKIA|rk_live_|rk_test_)|^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function looksLikeSecret(text: string): boolean {
  return SECRET_RE.test(text.trim());
}

// ── Schema validator ──────────────────────────────────────────────────────────
function isValidEntry(e: unknown): e is ClipHistoryEntry {
  if (typeof e !== "object" || e === null) return false;
  const entry = e as Record<string, unknown>;
  return (
    typeof entry.id   === "string" &&
    typeof entry.text === "string" &&
    typeof entry.ts   === "number"
  );
}

// ── Storage helpers ──────────────────────────────────────────────────────────

function load(): ClipHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each entry — reject malformed objects
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

function save(entries: ClipHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full — silently ignore
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseClipboardHistoryReturn {
  history: ClipHistoryEntry[];
  push: (text: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export function useClipboardHistory(): UseClipboardHistoryReturn {
  const [history, setHistory] = useState<ClipHistoryEntry[]>(() => load());

  // Persist on every change
  useEffect(() => {
    save(history);
  }, [history]);

  const push = useCallback((text: string) => {
    if (!text.trim()) return;
    // Never persist secrets (API keys, tokens, JWTs…)
    if (looksLikeSecret(text)) return;
    setHistory((prev) => {
      // Remove existing duplicate (by text content)
      const filtered = prev.filter((e) => e.text !== text);
      // Prepend new entry
      const next: ClipHistoryEntry[] = [
        { id: uid(), text, ts: Date.now() },
        ...filtered,
      ].slice(0, MAX_ENTRIES);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, push, remove, clear };
}
