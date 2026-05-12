import type { ContentType, ClipAction } from "@/types";
import {
  Zap,
  Scissors,
  Type,
  ArrowUpDown,
  Copy,
  Lock,
  Unlock,
  Globe,
  Braces,
  Minimize2,
  CheckCircle2,
  EyeOff,
  Shield,
  Palette,
  FileCode,
  AlignLeft,
  CaseSensitive,
  Repeat2,
  CaseLower,
  Wand2,
  List,
  Heart,
  BookOpen,
  MessageCircle,
  Briefcase,
  ChevronsUp,
  FileText,
  Sparkles,
} from "lucide-react";

// ─── Transform functions ──────────────────────────────────────────────────────

export const transformFns: Record<string, (text: string) => string> = {
  "smart-fix": (t) =>
    t
      .trim()
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n"),

  trim: (t) => t.trim(),

  "title-case": (t) =>
    t.replace(/\b\w/g, (c) => c.toUpperCase()),

  uppercase: (t) => t.toUpperCase(),

  lowercase: (t) => t.toLowerCase(),

  "single-space": (t) => t.replace(/[ \t]+/g, " ").trim(),

  "remove-blank-lines": (t) =>
    t
      .split("\n")
      .filter((l) => l.trim())
      .join("\n"),

  "dedup-lines": (t) => [...new Set(t.split("\n"))].join("\n"),

  "sort-lines": (t) =>
    t
      .split("\n")
      .sort((a, b) => a.localeCompare(b))
      .join("\n"),

  "reverse-lines": (t) => t.split("\n").reverse().join("\n"),

  "base64-encode": (t) => btoa(unescape(encodeURIComponent(t))),

  "base64-decode": (t) => {
    try {
      return decodeURIComponent(escape(atob(t.trim())));
    } catch {
      return t;
    }
  },

  "url-decode": (t) => {
    try {
      return decodeURIComponent(t.trim());
    } catch {
      return t;
    }
  },

  "url-encode": (t) => encodeURIComponent(t.trim()),

  "extract-domain": (t) => {
    try {
      return new URL(t.trim()).hostname;
    } catch {
      return t;
    }
  },

  "format-json": (t) => {
    try {
      return JSON.stringify(JSON.parse(t), null, 2);
    } catch {
      return t;
    }
  },

  "minify-json": (t) => {
    try {
      return JSON.stringify(JSON.parse(t));
    } catch {
      return t;
    }
  },

  "hex-to-rgb": (t) => {
    const hex = t.trim().replace("#", "");
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  },

  "hex-to-hsl": (t) => {
    const hex = t.trim().replace("#", "");
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    let r = parseInt(full.slice(0, 2), 16) / 255;
    let g = parseInt(full.slice(2, 4), 16) / 255;
    let b = parseInt(full.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  },

  "css-var": (t) => {
    const hex = t.trim().replace("#", "");
    const name = `color-${hex.toLowerCase()}`;
    return `--${name}: ${t.trim()};`;
  },

  "mask-secret": (t) => {
    const trimmed = t.trim();
    if (trimmed.length <= 8) return "•".repeat(trimmed.length);
    return trimmed.slice(0, 4) + "•".repeat(trimmed.length - 8) + trimmed.slice(-4);
  },

  "strip-ai-fluff": (t) =>
    t
      .replace(/^(certainly[,!]?\s*|of course[,!]?\s*|absolutely[,!]?\s*|sure[,!]\s*|great question[,!]?\s*)[^\n]*/im, "")
      .replace(/\b(feel free to (?:ask|reach out)[^.!?]*[.!?]|let me know if you[^.!?]*[.!?]|i hope this (?:helps|was helpful)[^.!?]*[.!?]|don't hesitate to[^.!?]*[.!?]|is there anything else[^.!?]*[.!?])/gi, "")
      .replace(/\b(it(?:'s| is) worth noting that\s*|it(?:'s| is) important to note that\s*|needless to say,?\s*)/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),

  "remove-ai-opener": (t) => {
    const match = t.match(/^[^.!?\n]+[.!?]\s+/);
    if (!match) return t;
    const first = match[0].trim();
    if (/^(certainly|of course|absolutely|sure[!,]|great question|i'?d be happy|i'?d be glad|i can help|i understand|i appreciate|i'?ll help)/i.test(first)) {
      return t.slice(match[0].length).trim();
    }
    return t;
  },

  "extract-bullets": (t) => {
    const bullets = t
      .split("\n")
      .filter((l) => /^\s*[-*•]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l));
    return bullets.length > 0 ? bullets.map((l) => l.trim()).join("\n") : t;
  },

  "humanize": (t) =>
    t
      .replace(/^(certainly[,!]?\s*|of course[,!]?\s*|absolutely[,!]?\s*|i'?d be happy to help[^.!?]*[.!?]\s*)/im, "")
      .replace(/\b(feel free to (?:ask|reach out)[^.!?]*[.!?]|let me know if you[^.!?]*[.!?]|i hope this (?:helps|was helpful)[^.!?]*[.!?]|don't hesitate to[^.!?]*[.!?]|is there anything else i can[^.!?]*[.!?])/gi, "")
      .replace(/\bleverage\b/gi, "use")
      .replace(/\butilize\b/gi, "use")
      .replace(/\bfacilitate\b/gi, "help")
      .replace(/\bdelve into\b/gi, "explore")
      .replace(/\bcomprehensive\b/gi, "complete")
      .replace(/\bseamless\b/gi, "smooth")
      .replace(/\brobust\b/gi, "solid")
      .replace(/\btailored\b/gi, "customized")
      .replace(/\bholistic\b/gi, "overall")
      .replace(/\bcutting-edge\b/gi, "modern")
      .replace(/\binnovative\b/gi, "new")
      .replace(/\bdynamic\b/gi, "flexible")
      .replace(/\b(it'?s worth noting that|it is worth noting that|it'?s important to note that|it is important to note that)\s*/gi, "")
      .replace(/\b(furthermore,?|moreover,?)\s*/gi, "Also, ")
      .replace(/\bin conclusion,?\s*/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),

  "summarize": (t) => {
    const paragraphs = t.split(/\n\n+/).filter((p) => p.trim().length > 0);
    return paragraphs
      .map((p) => {
        const match = p.match(/^[^.!?\n]+[.!?]/);
        return match ? match[0].trim() : p.trim();
      })
      .join(" ");
  },

  "casual": (t) =>
    t
      .replace(/\bI am\b/g, "I'm")
      .replace(/\bI will\b/g, "I'll")
      .replace(/\bI have\b/g, "I've")
      .replace(/\bIt is\b/g, "It's")
      .replace(/\bThat is\b/g, "That's")
      .replace(/\bDo not\b/g, "Don't")
      .replace(/\bCannot\b/g, "Can't")
      .replace(/\bWill not\b/g, "Won't")
      .replace(/\bHowever,\b/g, "But,")
      .replace(/\bNevertheless,\b/g, "Still,")
      .replace(/\bFurthermore,\b/g, "Also,")
      .replace(/\brequire\b/gi, "need")
      .replace(/\bpurchase\b/gi, "buy")
      .replace(/\bcommence\b/gi, "start")
      .replace(/\bterminate\b/gi, "end")
      .replace(/\bassist\b/gi, "help")
      .replace(/\butilize\b/gi, "use")
      .trim(),

  "professional": (t) =>
    t
      .replace(/\bI'm\b/g, "I am")
      .replace(/\bI'll\b/g, "I will")
      .replace(/\bI've\b/g, "I have")
      .replace(/\bIt's\b/g, "It is")
      .replace(/\bThat's\b/g, "That is")
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bwon't\b/gi, "will not")
      .replace(/\bisn't\b/gi, "is not")
      .replace(/\baren't\b/gi, "are not")
      .replace(/\bwe're\b/gi, "we are")
      .replace(/\bthey're\b/gi, "they are")
      .replace(/\bneed\b/gi, "require")
      .replace(/\bbuy\b/gi, "purchase")
      .replace(/\bhelp\b/gi, "assist")
      .replace(/\buse\b/gi, "utilize")
      .replace(/\bshow\b/gi, "demonstrate")
      .replace(/\btell\b/gi, "inform")
      .replace(/!/g, ".")
      .trim(),

  "shorten": (t) =>
    t
      .replace(/\b(very|really|quite|basically|actually|literally|just|simply|extremely|incredibly|absolutely|definitely|certainly|totally|completely|honestly|obviously|generally|essentially)\s+/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim(),

  "clean-markdown": (t) =>
    t
      .replace(/^(#{1,6})\s*/gm, "$1 ")
      .replace(/[ \t]+$/gm, "")
      .replace(/^\* /gm, "- ")
      .replace(/^• /gm, "- ")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),

  "markdown-to-text": (t) =>
    t
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^```[\s\S]*?```$/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/^>\s*/gm, "")
      .replace(/^[-*_]{3,}\s*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),

  "clean-url": (t) => {
    try {
      const url = new URL(t.trim());
      [
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "fbclid", "gclid", "dclid", "gbraid", "wbraid",
        "ref", "referrer", "source", "mc_cid", "mc_eid",
        "_ga", "igshid", "scid", "click_id", "_hsenc", "_hsmi",
      ].forEach((p) => url.searchParams.delete(p));
      return url.toString();
    } catch {
      return t;
    }
  },

  "extract-url-params": (t) => {
    try {
      const url = new URL(t.trim());
      const params = [...url.searchParams.entries()];
      const lines = [`Host: ${url.hostname}`, `Path: ${url.pathname}`];
      if (params.length > 0) {
        lines.push("", "Parameters:");
        params.forEach(([k, v]) => lines.push(`  ${k}: ${v}`));
      }
      return lines.join("\n");
    } catch {
      return t;
    }
  },

  "remove-line-breaks": (t) =>
    t.replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim(),

  "capitalize": (t) =>
    t.replace(/(^|(?<=[.!?]\s+))([a-z])/g, (_, pre, ch) => (pre ?? "") + ch.toUpperCase()),
};

// ─── Actions per content type ─────────────────────────────────────────────────

export const actionsByType: Record<ContentType, ClipAction[]> = {
  empty: [],

  text: [
    { id: "smart-fix",          label: "Smart Fix",    icon: Zap,          variant: "primary", shortcut: "Enter", description: "Trim whitespace & normalize line breaks" },
    { id: "humanize",           label: "Humanize",     icon: Heart,        description: "Remove AI filler & buzzwords" },
    { id: "summarize",          label: "Summarize",    icon: BookOpen },
    { id: "shorten",            label: "Shorten",      icon: ChevronsUp },
    { id: "casual",             label: "Casual",       icon: MessageCircle },
    { id: "professional",       label: "Professional", icon: Briefcase },
    { id: "title-case",         label: "Title Case",   icon: Type },
    { id: "capitalize",         label: "Capitalize",   icon: CaseSensitive },
    { id: "remove-line-breaks", label: "Join Lines",   icon: AlignLeft },
    { id: "sort-lines",         label: "Sort Lines",   icon: ArrowUpDown },
    { id: "lowercase",          label: "Lowercase",    icon: CaseLower },
    { id: "base64-encode",      label: "Encode B64",   icon: Lock },
  ],

  url: [
    { id: "url-decode",         label: "Decode URL",     icon: Unlock,   variant: "primary", shortcut: "Enter", description: "Decode percent-encoded characters" },
    { id: "clean-url",          label: "Clean URL",      icon: Sparkles, description: "Remove tracking parameters" },
    { id: "extract-url-params", label: "Extract Params", icon: List },
    { id: "extract-domain",     label: "Domain Only",    icon: Globe },
    { id: "url-encode",         label: "Encode URL",     icon: Lock },
  ],

  json: [
    { id: "format-json",  label: "Beautify",   icon: Braces,    variant: "primary", shortcut: "Enter", description: "Pretty-print with 2-space indent" },
    { id: "minify-json",  label: "Minify",     icon: Minimize2, description: "Compact single-line output" },
    { id: "base64-encode",label: "Encode B64", icon: Lock },
  ],

  code: [
    { id: "trim",               label: "Trim",          icon: Scissors, variant: "primary", shortcut: "Enter" },
    { id: "remove-blank-lines", label: "Remove Blanks", icon: FileCode },
    { id: "single-space",       label: "Clean Spaces",  icon: AlignLeft },
    { id: "base64-encode",      label: "Encode B64",    icon: Lock },
  ],

  color: [
    { id: "hex-to-rgb", label: "→ RGB",        icon: Palette,      variant: "primary", shortcut: "Enter" },
    { id: "hex-to-hsl", label: "→ HSL",        icon: Palette },
    { id: "css-var",    label: "CSS Variable", icon: FileCode },
    { id: "uppercase",  label: "Uppercase",    icon: CaseSensitive },
  ],

  email: [
    { id: "lowercase",    label: "Lowercase", icon: CaseLower, variant: "primary", description: "Normalize to lowercase" },
    { id: "trim",         label: "Trim",      icon: Scissors },
    { id: "base64-encode",label: "Encode B64",icon: Lock },
  ],

  csv: [
    { id: "sort-lines",  label: "Sort Rows",   icon: ArrowUpDown, variant: "primary", description: "Sort rows alphabetically" },
    { id: "dedup-lines", label: "Deduplicate", icon: Repeat2 },
    { id: "trim",        label: "Trim",        icon: Scissors },
  ],

  secret: [
    { id: "mask-secret",  label: "Mask Secret", icon: EyeOff,  variant: "danger",  shortcut: "Enter", description: "Reveal only first & last 4 chars" },
    { id: "base64-encode",label: "Encode B64",  icon: Lock,    variant: "default" },
    { id: "base64-decode",label: "Decode B64",  icon: Unlock },
    { id: "trim",         label: "Trim",        icon: Scissors },
  ],

  markdown: [
    { id: "clean-markdown",    label: "Clean",            icon: Wand2,    variant: "primary", shortcut: "Enter", description: "Normalize spacing & bullets" },
    { id: "markdown-to-text",  label: "Strip Formatting", icon: FileText, description: "Convert to plain text" },
    { id: "remove-blank-lines",label: "Remove Blanks",    icon: FileCode },
    { id: "trim",              label: "Trim",             icon: Scissors },
    { id: "base64-encode",     label: "Encode B64",       icon: Lock },
  ],

  ai: [
    { id: "strip-ai-fluff",   label: "Strip Fluff",     icon: Wand2,    variant: "primary", shortcut: "Enter", description: "Remove filler & transitional phrases" },
    { id: "humanize",         label: "Humanize",        icon: Heart,    description: "Replace buzzwords naturally" },
    { id: "summarize",        label: "Summarize",       icon: BookOpen },
    { id: "extract-bullets",  label: "Extract Bullets", icon: List },
    { id: "remove-ai-opener", label: "Remove Opener",   icon: Scissors },
  ],

  number: [
    { id: "trim",         label: "Trim",      icon: Scissors, variant: "primary" },
    { id: "base64-encode",label: "Encode B64",icon: Lock },
  ],
};

export const allActionsById: Record<string, ClipAction> = Object.fromEntries(
  Object.values(actionsByType).flat().map((a) => [a.id, a])
);

export { Copy, CheckCircle2, Shield };
