// ─── Types ────────────────────────────────────────────────────────────────────

export type DiffType = "equal" | "insert" | "delete";

export interface DiffSegment {
  type: DiffType;
  text: string;
}

export interface DiffStats {
  charDelta: number;
  wordDelta: number;
  insertions: number;  // number of changed segments that are inserts
  deletions: number;   // number of changed segments that are deletes
}

// ─── Tokeniser ────────────────────────────────────────────────────────────────
// Each token is either a run of non-whitespace or a run of whitespace,
// so reconstructing the text is lossless: tokens.join('') === original.

function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

// ─── LCS table (standard DP) ─────────────────────────────────────────────────

function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  // Use flat array for speed: dp[i*(n+1)+j]
  const dp = new Int32Array((m + 1) * (n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i * (n + 1) + j] =
        a[i - 1] === b[j - 1]
          ? dp[(i - 1) * (n + 1) + (j - 1)] + 1
          : Math.max(dp[(i - 1) * (n + 1) + j], dp[i * (n + 1) + (j - 1)]);
    }
  }
  return dp as unknown as number[][];
}

// ─── Backtrack (iterative) ───────────────────────────────────────────────────

function backtrack(
  dp: number[][] | Int32Array,
  _n1: number,
  a: string[],
  b: string[]
): DiffSegment[] {
  const ops: DiffSegment[] = [];
  let i = a.length;
  let j = b.length;
  const n = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: "equal", text: a[i - 1] });
      i--;
      j--;
    } else if (
      j > 0 &&
      (i === 0 ||
        (dp as Int32Array)[i * (n + 1) + (j - 1)] >=
          (dp as Int32Array)[(i - 1) * (n + 1) + j])
    ) {
      ops.push({ type: "insert", text: b[j - 1] });
      j--;
    } else {
      ops.push({ type: "delete", text: a[i - 1] });
      i--;
    }
  }

  ops.reverse();
  return ops;
}

// ─── Merge adjacent same-type ops ────────────────────────────────────────────

function merge(segs: DiffSegment[]): DiffSegment[] {
  return segs.reduce<DiffSegment[]>((acc, seg) => {
    const last = acc[acc.length - 1];
    if (last && last.type === seg.type) {
      last.text += seg.text;
    } else {
      acc.push({ type: seg.type, text: seg.text });
    }
    return acc;
  }, []);
}

// ─── Coarse line-level fallback for very large texts ─────────────────────────

function lineDiff(a: string, b: string): DiffSegment[] {
  const la = a.split("\n");
  const lb = b.split("\n");
  const result: DiffSegment[] = [];
  const len = Math.max(la.length, lb.length);
  for (let i = 0; i < len; i++) {
    const lineA = la[i] ?? "";
    const lineB = lb[i] ?? "";
    const nl = i < len - 1 ? "\n" : "";
    if (lineA === lineB) {
      result.push({ type: "equal", text: lineA + nl });
    } else {
      if (lineA) result.push({ type: "delete", text: lineA + nl });
      if (lineB) result.push({ type: "insert", text: lineB + nl });
    }
  }
  return merge(result);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function diffWords(a: string, b: string): DiffSegment[] {
  if (a === b) return [{ type: "equal", text: a }];
  if (!a.trim()) return [{ type: "insert", text: b }];
  if (!b.trim()) return [{ type: "delete", text: a }];

  const tokA = tokenize(a);
  const tokB = tokenize(b);

  // Safety valve — fall back to line diff for huge texts
  if (tokA.length * tokB.length > 80_000) {
    return lineDiff(a, b);
  }

  const table = lcsTable(tokA, tokB);
  const raw = backtrack(table, tokB.length, tokA, tokB);
  return merge(raw);
}

export function diffStats(a: string, b: string, segs: DiffSegment[]): DiffStats {
  const charDelta = b.length - a.length;
  const wordsDelta =
    b.trim().split(/\s+/).filter(Boolean).length -
    a.trim().split(/\s+/).filter(Boolean).length;
  const insertions = segs.filter((s) => s.type === "insert").length;
  const deletions = segs.filter((s) => s.type === "delete").length;
  return { charDelta, wordDelta: wordsDelta, insertions, deletions };
}
