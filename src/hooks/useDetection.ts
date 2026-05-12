import { useState, useEffect, useRef } from "react";
import type { DetectionResult } from "@/types";
import {
  detectUrl,
  detectColor,
  detectJson,
  detectSecret,
  detectCode,
  detectAI,
  detectMarkdown,
  detectCsv,
  detectEmail,
  detectNumber,
  type DetectionContext,
} from "@utils/detectionUtils";

const MAX_DETECT_CHARS = 200_000; // guard against ReDoS on huge inputs

function detect(text: string): DetectionResult {
  const trimmed = text.trim();

  if (!trimmed) return { type: "empty", confidence: 1 };

  // Skip expensive regex detection on oversized inputs — treat as plain text
  if (trimmed.length > MAX_DETECT_CHARS) {
    const words = trimmed.split(/\s+/).filter(Boolean);
    return { type: "text", confidence: 1, wordCount: words.length, charCount: trimmed.length, lineCount: trimmed.split("\n").length };
  }

  const lines = trimmed.split("\n");
  const words = trimmed.split(/\s+/).filter(Boolean);
  const chars = trimmed.length;
  const ctx: DetectionContext = { trimmed, lines, words, chars };

  const url = detectUrl(ctx);
  if (url) return { type: "url", ...url };

  const color = detectColor(ctx);
  if (color) return { type: "color", ...color };

  const json = detectJson(ctx);
  if (json) return { type: "json", ...json };

  const secret = detectSecret(ctx);
  if (secret) return { type: "secret", ...secret };

  const code = detectCode(ctx);
  if (code) return { type: "code", ...code };

  const ai = detectAI(ctx);
  if (ai) return { type: "ai", ...ai };

  const markdown = detectMarkdown(ctx);
  if (markdown) return { type: "markdown", ...markdown };

  const csv = detectCsv(ctx);
  if (csv) return { type: "csv", ...csv };

  const email = detectEmail(ctx);
  if (email) return { type: "email", ...email };

  const number = detectNumber(ctx);
  if (number) return { type: "number", ...number };

  return {
    type: "text",
    confidence: 1,
    wordCount: words.length,
    charCount: chars,
    lineCount: lines.length,
  };
}

export function useDetection(value: string, debounceMs = 280) {
  const [result, setResult] = useState<DetectionResult>({ type: "empty", confidence: 1 });
  const [analyzing, setAnalyzing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!value.trim()) {
      setAnalyzing(false);
      setResult({ type: "empty", confidence: 1 });
      return;
    }

    setAnalyzing(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setResult(detect(value));
      setAnalyzing(false);
    }, debounceMs);

    return () => clearTimeout(timer.current);
  }, [value, debounceMs]);

  return { result, analyzing };
}
