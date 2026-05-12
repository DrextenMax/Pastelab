// ─── App-wide persistent settings ────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";

export interface ClipFixSettings {
  watcherEnabled: boolean;    // poll clipboard for changes when panel is empty
  toastsEnabled: boolean;     // show toast notifications
  historyEnabled: boolean;    // record clipboard history
  onboarded: boolean;         // first-run onboarding seen
}

const DEFAULTS: ClipFixSettings = {
  watcherEnabled: true,
  toastsEnabled: true,
  historyEnabled: true,
  onboarded: false,
};

const KEY = "pastelab:settings";

function load(): ClipFixSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function persist(s: ClipFixSettings): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function useSettings() {
  const [settings, setSettings] = useState<ClipFixSettings>(() => load());

  useEffect(() => { persist(settings); }, [settings]);

  const set = useCallback(<K extends keyof ClipFixSettings>(
    key: K,
    value: ClipFixSettings[K]
  ) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings({ ...DEFAULTS }), []);

  return { settings, set, reset };
}
