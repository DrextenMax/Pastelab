// ─── Clipboard ────────────────────────────────────────────────────────────────

export type ClipboardItemType = "text" | "image" | "code" | "url" | "color";

export interface ClipboardItem {
  id: string;
  type: ClipboardItemType;
  content: string;
  preview?: string;
  sourceApp?: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  language?: string;
}

// ─── Content Detection ────────────────────────────────────────────────────────

export type ContentType =
  | "empty"
  | "text"
  | "ai"
  | "url"
  | "json"
  | "code"
  | "color"
  | "email"
  | "csv"
  | "secret"
  | "markdown"
  | "number";

export interface DetectionResult {
  type: ContentType;
  confidence: number;
  language?: string;
  wordCount?: number;
  charCount?: number;
  lineCount?: number;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type ActionVariant = "primary" | "default" | "danger" | "success";

export interface ClipAction {
  id: string;
  label: string;
  icon: React.ElementType;
  variant?: ActionVariant;
  description?: string;
  shortcut?: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type PageId = "dashboard" | "history" | "pinned" | "settings";

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  badge?: number;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "system";

// ─── Utility ──────────────────────────────────────────────────────────────────

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Variant = "default" | "primary" | "ghost" | "danger" | "outline";
export type ColorScheme = "violet" | "cyan" | "emerald" | "amber" | "rose";
