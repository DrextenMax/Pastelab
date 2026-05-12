export interface DetectionContext {
  trimmed: string;
  lines: string[];
  words: string[];
  chars: number;
}

type Extra = {
  confidence: number;
  language?: string;
  wordCount?: number;
  charCount?: number;
  lineCount?: number;
};

export function detectUrl({ trimmed, chars }: DetectionContext): Extra | null {
  if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
    return { confidence: 0.99, charCount: chars };
  }
  return null;
}

export function detectColor({ trimmed, chars }: DetectionContext): Extra | null {
  if (
    /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed) ||
    /^rgba?\(\s*\d/.test(trimmed) ||
    /^hsla?\(\s*\d/.test(trimmed)
  ) {
    return { confidence: 0.99, charCount: chars };
  }
  return null;
}

export function detectJson({ trimmed, lines, chars }: DetectionContext): Extra | null {
  if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
    try {
      JSON.parse(trimmed);
      return { confidence: 0.98, lineCount: lines.length, charCount: chars };
    } catch {
      // not valid JSON
    }
  }
  return null;
}

export function detectSecret({ trimmed, chars }: DetectionContext): Extra | null {
  if (
    /^(sk-|pk-|Bearer\s|ghp_|glpat-|AKIA|rk_live_|rk_test_)/.test(trimmed) ||
    /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed) ||
    (/^[A-Za-z0-9+/]{40,}={0,2}$/.test(trimmed.replace(/\s/g, "")) && !trimmed.includes(" "))
  ) {
    return { confidence: 0.9, charCount: chars };
  }
  return null;
}

export function detectCode({ trimmed, lines, words, chars }: DetectionContext): (Extra & { language: string }) | null {
  const patterns: { lang: string; re: RegExp }[] = [
    { lang: "typescript", re: /\b(import\s+[\w{*]|export\s+(default|const|function|class|type)|interface\s+\w|const\s+\w|let\s+\w|type\s+\w+\s*=|=>\s*[{(]|async\s+(function|\(|\w)|await\s+\w)\b/ },
    { lang: "python",     re: /^(def |class |import |from |if __name__)/ },
    { lang: "rust",       re: /^(fn |pub |use |struct |impl |let mut )/ },
    { lang: "sql",        re: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s/i },
    { lang: "css",        re: /^\s*[\w-]+\s*:\s*[^;{]+;/m },
    { lang: "html",       re: /^<(html|head|body|div|span|p|a|ul|ol|li|h[1-6]|script|style|form|input|button|table|tr|td|th|nav|section|article|main|header|footer|img)[^>]*>/i },
    { lang: "bash",       re: /^(#!\/|export [A-Z_]+=|source |chmod |sudo |apt |brew |npm |yarn |git )/ },
  ];
  for (const { lang, re } of patterns) {
    if (re.test(trimmed)) {
      return { confidence: 0.85, language: lang, lineCount: lines.length, charCount: chars, wordCount: words.length };
    }
  }
  return null;
}

export function detectAI({ trimmed, lines, words, chars }: DetectionContext): Extra | null {
  // Require substantial text to avoid false positives
  if (words.length < 40) return null;

  let score = 0;

  // Common AI opener phrases at the very start (strong signal)
  if (/^(certainly[,!]?|of course[,!]?|absolutely[,!]?|sure[,!]|great question|i'?d be happy|i'?d be glad|i can help you|i can certainly|i understand|i appreciate)\b/i.test(trimmed)) {
    score += 35;
  }

  // AI self-reference (very strong signal)
  if (/\bas an ai\b|\bas a language model\b|\bas an artificial intelligence\b|\bi'?m claude\b|\bi'?m gpt\b|\bi'?m chatgpt\b/i.test(trimmed)) {
    score += 50;
  }

  // Transitional/connector phrases (each adds 12, capped at 36)
  const transitionCount = (trimmed.match(
    /\b(however,|moreover,|furthermore,|additionally,|it(?:'s| is) worth noting|it(?:'s| is) important to note|in conclusion,?|to summarize,?|in summary,?|notably,|importantly,|that said,|having said that,|with that in mind,)/gi
  ) ?? []).length;
  score += Math.min(transitionCount * 12, 36);

  // AI closer / handoff phrases (strong signal)
  if (/\b(feel free to ask|let me know if you|i hope this helps|hope that helps|don't hesitate to|please let me know|if you have (?:any |more )?questions|is there anything else i can|happy to help|glad to help)\b/i.test(trimmed)) {
    score += 20;
  }

  // Bold section headers "**Heading**" — very characteristic of AI structured output (each +8, capped at 24)
  const boldHeaders = (trimmed.match(/^\*\*[^*\n]+\*\*\s*$/gm) ?? []).length;
  score += Math.min(boldHeaders * 8, 24);

  // AI verbal tics and corporate buzzwords (each +6, capped at 24)
  const tics = (trimmed.match(
    /\b(delve|leverage|utilize|paradigm|synergy|streamline|cutting-edge|robust|comprehensive|nuanced|holistic|tailored|seamless|empower|foster|facilitate|innovative|dynamic|scalable)\b/gi
  ) ?? []).length;
  score += Math.min(tics * 6, 24);

  // Multi-paragraph structured text (3+ substantive paragraphs, 100+ words)
  const substantiveParagraphs = trimmed.split(/\n\n+/).filter((p) => p.trim().length > 50);
  if (substantiveParagraphs.length >= 3 && words.length > 100) score += 15;

  if (score < 45) return null;

  const confidence = Math.min(0.95, 0.45 + (score - 45) * 0.008);
  return { confidence, wordCount: words.length, charCount: chars, lineCount: lines.length };
}

export function detectMarkdown({ trimmed, lines, words, chars }: DetectionContext): Extra | null {
  if (
    /^#{1,6}\s/.test(trimmed) ||
    /^\*\*.+\*\*/.test(trimmed) ||
    /^\[.+\]\(.+\)/.test(trimmed) ||
    /^[-*]\s/.test(trimmed)
  ) {
    return { confidence: 0.8, wordCount: words.length, lineCount: lines.length, charCount: chars };
  }
  return null;
}

export function detectCsv({ lines, chars }: DetectionContext): Extra | null {
  const firstLine = lines[0];
  if (lines.length > 1 && firstLine.includes(",") && firstLine.split(",").length >= 2) {
    const consistent = lines.slice(0, 5).every((l) => l.split(",").length === firstLine.split(",").length);
    if (consistent) return { confidence: 0.75, lineCount: lines.length, charCount: chars };
  }
  return null;
}

export function detectEmail({ trimmed, chars }: DetectionContext): Extra | null {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { confidence: 0.95, charCount: chars };
  }
  return null;
}

export function detectNumber({ trimmed: t, chars }: DetectionContext): Extra | null {
  if (/^-?[\d,._\s]+%?$/.test(t)) {
    return { confidence: 0.9, charCount: chars };
  }
  return null;
}
