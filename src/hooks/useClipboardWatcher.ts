// ─── Clipboard watcher ───────────────────────────────────────────────────────
// Polls the system clipboard at INTERVAL_MS and fires `onChanged` when the
// content changes.  Own-writes are suppressed via markOwnWrite() so that
// copy-to-clipboard actions inside PasteLab don't trigger the callback.

import { useEffect, useRef, useCallback } from "react";
import { readClipText } from "@utils/clipboard";

const INTERVAL_MS = 800;
const OWN_WRITE_TTL = 3_000;  // ms to ignore a value we wrote ourselves
const MAX_CHARS     = 200_000; // ~200 KB — silently ignore larger payloads

// ── Module-level own-write registry ──────────────────────────────────────────
// Exported so ClipPanel can call markOwnWrite() before writing to clipboard.

const ownWriteSet = new Set<string>();
const ownWriteTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Call this before writing `text` to the clipboard to suppress the change
 *  event that the watcher would otherwise emit. */
export function markOwnWrite(text: string): void {
  ownWriteSet.add(text);
  // Clear any previous timer for this text
  const prev = ownWriteTimers.get(text);
  if (prev) clearTimeout(prev);
  const t = setTimeout(() => {
    ownWriteSet.delete(text);
    ownWriteTimers.delete(text);
  }, OWN_WRITE_TTL);
  ownWriteTimers.set(text, t);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseClipboardWatcherOptions {
  /** Called when new clipboard text is detected (not from own writes). */
  onChanged: (text: string) => void;
  /** Set to false to pause watching (e.g. when the panel is focused). */
  enabled?: boolean;
}

export function useClipboardWatcher({
  onChanged,
  enabled = true,
}: UseClipboardWatcherOptions): void {
  const lastSeenRef = useRef<string | null>(null);
  const onChangedRef = useRef(onChanged);

  // Keep callback ref up to date without restarting the interval
  useEffect(() => {
    onChangedRef.current = onChanged;
  }, [onChanged]);

  const poll = useCallback(async () => {
    try {
      const text = await readClipText();
      if (!text) return;
      if (text.length > MAX_CHARS) return; // ignore oversized payloads
      if (text === lastSeenRef.current) return;
      if (ownWriteSet.has(text)) {
        // Acknowledge but don't fire callback
        lastSeenRef.current = text;
        return;
      }
      lastSeenRef.current = text;
      onChangedRef.current(text);
    } catch {
      // Silently ignore read failures
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Run once immediately so we know what's already in the clipboard
    poll();
    const id = setInterval(poll, INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, poll]);
}
