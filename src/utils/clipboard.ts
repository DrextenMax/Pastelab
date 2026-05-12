// ─── System clipboard abstraction ────────────────────────────────────────────
// Prefers @tauri-apps/plugin-clipboard-manager (full access, no focus needed),
// falls back to navigator.clipboard for browser / dev mode.

export const isTauriCtx = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

type TauriClipMod = {
  readText: () => Promise<string | null>;
  writeText: (text: string) => Promise<void>;
};

let _mod: TauriClipMod | null = null;
let _modLoading = false;
let _modResolvers: Array<(m: TauriClipMod | null) => void> = [];

async function getTauriMod(): Promise<TauriClipMod | null> {
  if (_mod) return _mod;
  if (!isTauriCtx()) return null;

  if (_modLoading) {
    return new Promise((res) => _modResolvers.push(res));
  }

  _modLoading = true;
  try {
    _mod = await import("@tauri-apps/plugin-clipboard-manager");
    _modResolvers.forEach((r) => r(_mod));
    return _mod;
  } catch {
    _modResolvers.forEach((r) => r(null));
    return null;
  } finally {
    _modLoading = false;
    _modResolvers = [];
  }
}

/** Read plain text from the system clipboard. Returns "" on any failure. */
export async function readClipText(): Promise<string> {
  const tc = await getTauriMod();
  if (tc) {
    try { return (await tc.readText()) ?? ""; } catch {}
  }
  try { return await navigator.clipboard.readText(); } catch {}
  return "";
}

/** Write plain text to the system clipboard. */
export async function writeClipText(text: string): Promise<void> {
  const tc = await getTauriMod();
  if (tc) {
    try { await tc.writeText(text); return; } catch {}
  }
  try { await navigator.clipboard.writeText(text); } catch {}
}
