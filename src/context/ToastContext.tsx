// ─── Toast context ────────────────────────────────────────────────────────────
// Provides app-wide toast notifications.
//
// Usage:
//   const { toast } = useToast();
//   toast.success("Copied to clipboard!");
//   toast.error("Something went wrong");
//   toast.info("Clipboard updated");

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  /** Milliseconds before auto-dismiss. Default: 2800 */
  duration?: number;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD"; payload: ToastItem }
  | { type: "REMOVE"; id: string };

function toastsReducer(state: ToastItem[], action: Action): ToastItem[] {
  switch (action.type) {
    case "ADD":
      // Keep max 5 visible at a time (oldest drops off)
      return [action.payload, ...state].slice(0, 5);
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ── Tiny ID ────────────────────────────────────────────────────────────────────

function tid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ToastAPI {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: ToastAPI;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(toastsReducer, []);

  const add = useCallback(
    (message: string, variant: ToastVariant, duration = 2800) => {
      const id = tid();
      dispatch({ type: "ADD", payload: { id, message, variant, duration } });
      setTimeout(() => dispatch({ type: "REMOVE", id }), duration + 400); // +400 for exit anim
    },
    []
  );

  const toast: ToastAPI = {
    success: (m, d) => add(m, "success", d),
    error: (m, d) => add(m, "error", d),
    info: (m, d) => add(m, "info", d),
    warning: (m, d) => add(m, "warning", d),
    dismiss: (id) => dispatch({ type: "REMOVE", id }),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
