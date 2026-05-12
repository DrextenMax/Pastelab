// ─── Types ────────────────────────────────────────────────────────────────────

export type HumanizeIntensity = 1 | 2 | 3 | 4 | 5;

export interface HumanizeChange {
  id: string;
  label: string;
  count: number;
}

export interface HumanizeResult {
  text: string;
  changes: HumanizeChange[];
}

export const INTENSITY_META: Record<HumanizeIntensity, { label: string; desc: string }> = {
  1: { label: "Subtle",   desc: "Removes AI openers & obvious buzzwords" },
  2: { label: "Light",    desc: "Simplifies connectors & filler phrases" },
  3: { label: "Balanced", desc: "Adds contractions & natural phrasing" },
  4: { label: "Strong",   desc: "Restructures heavy sentences" },
  5: { label: "Bold",     desc: "Full conversational rewrite" },
};

// ─── Internal tracking helper ─────────────────────────────────────────────────

function applyReplacements(
  text: string,
  pairs: Array<{ re: RegExp; to: string | ((m: string, ...args: string[]) => string) }>
): { text: string; count: number } {
  let count = 0;
  let result = text;
  for (const { re, to } of pairs) {
    const before = result;
    result = typeof to === "function"
      ? result.replace(re, to as (...args: string[]) => string)
      : result.replace(re, to);
    if (result !== before) {
      // count approximate matches
      const globalRe = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
      count += (before.match(globalRe) ?? []).length;
    }
  }
  return { text: result, count };
}

// ─── Pass 1 — AI signal removal (intensity 1+) ───────────────────────────────

const OPENER_RE =
  /^(certainly[,!]?\s*|of course[,!]?\s*|absolutely[,!]?\s*|sure[,!]\s*|great question[,!]?\s*|excellent question[,!]?\s*|good question[,!]?\s*|i['']?d be happy to\s+\w[^.!?\n]*[.!?]\s*|i['']?d be glad to\s+\w[^.!?\n]*[.!?]\s*|i can certainly\s+\w[^.!?\n]*[.!?]\s*|i['']?m here to help[^.!?\n]*[.!?]\s*|thank you for\s+\w[^.!?\n]*[.!?]\s*|thanks for\s+\w[^.!?\n]*[.!?]\s*)/im;

const CLOSER_RE =
  /(\s*feel free to (?:ask|reach out)[^.!?\n]*[.!?]|\s*let me know if you(?:'ve| have| need)?[^.!?\n]*[.!?]|\s*i hope (?:this|that) (?:helps|was helpful|clarifies)[^.!?\n]*[.!?]|\s*don't hesitate to[^.!?\n]*[.!?]|\s*is there anything else (?:i can|you['']?d like)[^.!?\n]*[.!?]|\s*happy to (?:help|answer|assist)[^.!?\n]*[.!?]|\s*please (?:don't hesitate|feel free)[^.!?\n]*[.!?])/gi;

function stripOpener(text: string): { text: string; count: number } {
  if (!OPENER_RE.test(text)) return { text, count: 0 };
  return { text: text.replace(OPENER_RE, "").trimStart(), count: 1 };
}

function stripClosers(text: string): { text: string; count: number } {
  const count = (text.match(CLOSER_RE) ?? []).length;
  return { text: text.replace(CLOSER_RE, "").trimEnd(), count };
}

const BUZZWORD_PAIRS: Array<{ re: RegExp; to: string }> = [
  { re: /\bleverage\b/gi,          to: "use" },
  { re: /\butilize\b/gi,           to: "use" },
  { re: /\butilization\b/gi,       to: "use" },
  { re: /\bfacilitate\b/gi,        to: "help" },
  { re: /\bdelve into\b/gi,        to: "explore" },
  { re: /\bdelve\b/gi,             to: "look" },
  { re: /\bcomprehensive\b/gi,     to: "thorough" },
  { re: /\bseamlessly\b/gi,         to: "smoothly" },
  { re: /\bseamless\b/gi,           to: "smooth" },
  { re: /\brobust\b/gi,            to: "solid" },
  { re: /\btailored\b/gi,          to: "customized" },
  { re: /\bholistic\b/gi,          to: "overall" },
  { re: /\bcutting-edge\b/gi,      to: "modern" },
  { re: /\bstate-of-the-art\b/gi,  to: "modern" },
  { re: /\binnovative\b/gi,        to: "new" },
  { re: /\bdynamic\b/gi,           to: "flexible" },
  { re: /\bscalable\b/gi,          to: "expandable" },
  { re: /\bparadigm\b/gi,          to: "model" },
  { re: /\bsynergy\b/gi,           to: "collaboration" },
  { re: /\bstreamline\b/gi,        to: "simplify" },
  { re: /\bempow(?:er|ering)\b/gi, to: "enable" },
  { re: /\bfoster\b/gi,            to: "build" },
  { re: /\bnuanced\b/gi,           to: "detailed" },
  { re: /\bintricate\b/gi,         to: "complex" },
  { re: /\bpivotal\b/gi,           to: "key" },
  { re: /\bcrucial\b/gi,           to: "important" },
  { re: /\bparamount\b/gi,         to: "top" },
  { re: /\bproactively\b/gi,        to: "early on" },
  { re: /\bproactive\b/gi,          to: "forward-thinking" },
  { re: /\bsynergize\b/gi,         to: "combine" },
  { re: /\boptimize\b/gi,          to: "improve" },
  { re: /\bmaximize\b/gi,          to: "increase" },
  { re: /\bminimize\b/gi,          to: "reduce" },
];

// ─── Pass 2 — Connectors & fillers (intensity 2+) ────────────────────────────

const CONNECTOR_PAIRS: Array<{ re: RegExp; to: string }> = [
  { re: /\bmoreover,?\s*/gi,                       to: "Also, " },
  { re: /\bfurthermore,?\s*/gi,                    to: "And " },
  { re: /\badditionally,?\s*/gi,                   to: "Also, " },
  { re: /\bconsequently,?\s*/gi,                   to: "So " },
  { re: /\btherefore,?\s*/gi,                      to: "So " },
  { re: /\bthus,?\s*/gi,                           to: "So " },
  { re: /\bhence,?\s*/gi,                          to: "So " },
  { re: /\bsubsequently,?\s*/gi,                   to: "Then " },
  { re: /\bin addition(?:\s+to that)?,?\s*/gi,     to: "Also, " },
  { re: /\bas a result(?:\s+of this)?,?\s*/gi,     to: "So " },
  { re: /\bfor this reason,?\s*/gi,                to: "That's why " },
  { re: /\bon the other hand,?\s*/gi,              to: "But " },
  { re: /\bnevertheless,?\s*/gi,                   to: "Still, " },
  { re: /\bnotwithstanding,?\s*/gi,                to: "Still, " },
  { re: /\bin contrast,?\s*/gi,                    to: "But " },
  { re: /\bby contrast,?\s*/gi,                    to: "But " },
  { re: /\bin comparison,?\s*/gi,                  to: "Compared to that, " },
  { re: /\bto summarize,?\s*/gi,                   to: "In short, " },
  { re: /\bto conclude,?\s*/gi,                    to: "" },
  { re: /\bin conclusion,?\s*/gi,                  to: "" },
  { re: /\bto sum up,?\s*/gi,                      to: "In short, " },
  { re: /\bin summary,?\s*/gi,                     to: "In short, " },
  { re: /\bin a nutshell,?\s*/gi,                  to: "Basically, " },
];

const FILLER_PAIRS: Array<{ re: RegExp; to: string }> = [
  { re: /\bin today[''']?s rapidly evolving (?:world|landscape|environment)[,.]?\s*/gi, to: "" },
  { re: /\bin today[''']?s fast-paced (?:world|environment)[,.]?\s*/gi,                to: "" },
  { re: /\bin the modern (?:era|world|age|landscape)[,.]?\s*/gi,                       to: "today " },
  { re: /\bin this day and age[,.]?\s*/gi,                                             to: "" },
  { re: /\bit (?:is|'?s) (?:worth noting|important to note) that\s*/gi,               to: "" },
  { re: /\bit (?:should|must) be noted that\s*/gi,                                    to: "" },
  { re: /\bit goes without saying(?: that)?\s*/gi,                                    to: "" },
  { re: /\bneedless to say,?\s*/gi,                                                   to: "" },
  { re: /\bas you (?:may|might|probably) (?:know|be aware)[,.]?\s*/gi,               to: "" },
  { re: /\bwithout further ado,?\s*/gi,                                               to: "" },
  { re: /\bwith that (?:being )?said,?\s*/gi,                                         to: "" },
  { re: /\bhaving said that,?\s*/gi,                                                  to: "" },
  { re: /\ball things considered,?\s*/gi,                                             to: "" },
  { re: /\bsuffice it to say(?: that)?,?\s*/gi,                                       to: "" },
  { re: /\bthe fact (?:of the matter|is) (?:that|is)\s*/gi,                           to: "" },
  { re: /\bat the end of the day,?\s*/gi,                                             to: "" },
  { re: /\bfrom a [\w\s]+ perspective,?\s*/gi,                                        to: "" },
  { re: /\bwhen it comes to(?: the)?\s*/gi,                                           to: "For " },
  { re: /\bthe (?:key|main|primary) (?:thing|point|aspect) (?:is|to note) (?:that|here)?\s*/gi, to: "" },
];

// ─── Pass 3 — Natural phrasing (intensity 3+) ────────────────────────────────

const CONTRACTION_PAIRS: Array<{ re: RegExp; to: string }> = [
  { re: /\bI am\b/g,         to: "I'm" },
  { re: /\bI will\b/g,       to: "I'll" },
  { re: /\bI have\b/g,       to: "I've" },
  { re: /\bI would\b/g,      to: "I'd" },
  { re: /\bIt is\b/g,        to: "It's" },
  { re: /\bit is\b/g,        to: "it's" },
  { re: /\bThat is\b/g,      to: "That's" },
  { re: /\bthat is\b/g,      to: "that's" },
  { re: /\bThere is\b/g,     to: "There's" },
  { re: /\bthere is\b/g,     to: "there's" },
  { re: /\bThey are\b/g,     to: "They're" },
  { re: /\bthey are\b/g,     to: "they're" },
  { re: /\bWe are\b/g,       to: "We're" },
  { re: /\bwe are\b/g,       to: "we're" },
  { re: /\bYou are\b/g,      to: "You're" },
  { re: /\byou are\b/g,      to: "you're" },
  { re: /\bHe is\b/g,        to: "He's" },
  { re: /\bhe is\b/g,        to: "he's" },
  { re: /\bShe is\b/g,       to: "She's" },
  { re: /\bshe is\b/g,       to: "she's" },
  { re: /\bdo not\b/gi,      to: "don't" },
  { re: /\bcannot\b/gi,      to: "can't" },
  { re: /\bwill not\b/gi,    to: "won't" },
  { re: /\bshould not\b/gi,  to: "shouldn't" },
  { re: /\bwould not\b/gi,   to: "wouldn't" },
  { re: /\bcould not\b/gi,   to: "couldn't" },
  { re: /\bdoes not\b/gi,    to: "doesn't" },
  { re: /\bdid not\b/gi,     to: "didn't" },
  { re: /\bis not\b/gi,      to: "isn't" },
  { re: /\bare not\b/gi,     to: "aren't" },
  { re: /\bhave not\b/gi,    to: "haven't" },
  { re: /\bhas not\b/gi,     to: "hasn't" },
  { re: /\bhad not\b/gi,     to: "hadn't" },
  { re: /\bwere not\b/gi,    to: "weren't" },
];

const CORPSPEAK_PAIRS: Array<{ re: RegExp; to: string }> = [
  { re: /\bin order to\b/gi,                    to: "to" },
  { re: /\bso as to\b/gi,                       to: "to" },
  { re: /\bdue to the fact that\b/gi,            to: "because" },
  { re: /\bowing to the fact that\b/gi,          to: "because" },
  { re: /\bin the event that\b/gi,               to: "if" },
  { re: /\bin cases where\b/gi,                  to: "when" },
  { re: /\bat this point in time\b/gi,           to: "now" },
  { re: /\bat the present time\b/gi,             to: "now" },
  { re: /\bat this moment in time\b/gi,          to: "right now" },
  { re: /\bon a regular basis\b/gi,              to: "regularly" },
  { re: /\bon a daily basis\b/gi,                to: "daily" },
  { re: /\bin a timely manner\b/gi,              to: "quickly" },
  { re: /\bin an efficient manner\b/gi,          to: "efficiently" },
  { re: /\bprior to\b/gi,                       to: "before" },
  { re: /\bsubsequent to\b/gi,                   to: "after" },
  { re: /\bwith regard to\b/gi,                  to: "about" },
  { re: /\bwith respect to\b/gi,                 to: "about" },
  { re: /\bin terms of\b/gi,                     to: "for" },
  { re: /\bfor the purpose of\b/gi,              to: "to" },
  { re: /\bin the process of\b/gi,               to: "while" },
  { re: /\bmake use of\b/gi,                     to: "use" },
  { re: /\btake into (?:account|consideration)\b/gi, to: "consider" },
  { re: /\bin the near future\b/gi,              to: "soon" },
  { re: /\bthe majority of\b/gi,                 to: "most" },
  { re: /\ba significant (?:number|portion|amount) of\b/gi, to: "many" },
  { re: /\ba wide (?:range|variety) of\b/gi,     to: "many" },
  { re: /\bfor the most part\b/gi,               to: "mostly" },
  { re: /\bin spite of the fact that\b/gi,       to: "although" },
  { re: /\bin light of the fact that\b/gi,       to: "because" },
  { re: /\bgiven the fact that\b/gi,             to: "since" },
  { re: /\bfrom a (?:technical|practical) standpoint\b/gi, to: "technically" },
  { re: /\bput simply(?:,)?\b/gi,               to: "" },
  { re: /\bsimply put(?:,)?\b/gi,               to: "" },
  { re: /\blong story short(?:,)?\b/gi,          to: "" },
  { re: /\bto put it (?:simply|plainly|differently)(?:,)?\b/gi, to: "" },
];

// ─── Pass 4 — Sentence restructuring (intensity 4+) ─────────────────────────

const INTENSIFIER_RE =
  /\b(very|really|quite|extremely|incredibly|absolutely|completely|totally|utterly|terribly|awfully|exceptionally|extraordinarily|immensely|tremendously)\s+/gi;

// Break sentences > ~32 words at ", and " / ", but " / ". However,"
function restructureSentences(text: string): { text: string; count: number } {
  let count = 0;
  // Split on ", and " at word boundaries mid-sentence (not at short ones)
  const result = text.replace(
    /([^.!?\n]{80,}?),\s+(and|but|so|yet|though|while|whereas)\s+/g,
    (_match, before, conj) => {
      const cap = conj.charAt(0).toUpperCase() + conj.slice(1);
      count++;
      return `${before}. ${cap} `;
    }
  );
  return { text: result, count };
}

// ─── Pass 5 — Conversational rewrite (intensity 5) ───────────────────────────

const HEDGE_PAIRS: Array<{ re: RegExp; to: string }> = [
  { re: /\bI (?:would |personally )?(?:think|believe|feel) that\s*/gi, to: "" },
  { re: /\bI (?:would |personally )?(?:think|believe|feel)\s+/gi,      to: "" },
  { re: /\bit (?:seems?|appears?) (?:that|as though|like)?\s*/gi,      to: "" },
  { re: /\bone might (?:say|argue|suggest) that\s*/gi,                  to: "" },
  { re: /\bsome might (?:argue|say) that\s*/gi,                         to: "" },
  { re: /\bperhaps\s+/gi,                                              to: "" },
  { re: /\bpossibly\s+/gi,                                             to: "" },
  { re: /\bit is (?:possible|conceivable) that\s*/gi,                   to: "" },
];

const PASSIVE_PAIRS: Array<{ re: RegExp; to: string }> = [
  // "is/are/was/were being done" → simpler forms
  { re: /\bcan be (?:easily )?used to\b/gi,       to: "works for" },
  { re: /\bshould be (?:noted|mentioned) that\b/gi, to: "" },
  { re: /\bis designed to\b/gi,                   to: "works to" },
  { re: /\bare designed to\b/gi,                  to: "work to" },
  { re: /\bis intended to\b/gi,                   to: "aims to" },
  { re: /\bwas (?:able to|found to)\b/gi,         to: "could" },
];

// ─── Main engine ──────────────────────────────────────────────────────────────

export function humanize(text: string, intensity: HumanizeIntensity): HumanizeResult {
  const changes: HumanizeChange[] = [];
  let t = text;

  // ── Level 1: AI markers + buzzwords ────────────────────────────────────────
  {
    const { text: t1, count: c1 } = stripOpener(t);
    const { text: t2, count: c2 } = stripClosers(t1);
    const aiCount = c1 + c2;
    if (aiCount > 0) changes.push({ id: "ai-markers", label: "AI phrases removed", count: aiCount });
    t = t2;
  }
  {
    const { text: t1, count } = applyReplacements(t, BUZZWORD_PAIRS);
    if (count > 0) changes.push({ id: "buzzwords", label: "Buzzwords replaced", count });
    t = t1;
  }

  if (intensity < 2) return { text: cleanup(t), changes };

  // ── Level 2: Connectors + fillers ──────────────────────────────────────────
  {
    const { text: t1, count } = applyReplacements(t, CONNECTOR_PAIRS);
    if (count > 0) changes.push({ id: "connectors", label: "Connectors simplified", count });
    t = t1;
  }
  {
    const { text: t1, count } = applyReplacements(t, FILLER_PAIRS);
    if (count > 0) changes.push({ id: "fillers", label: "Filler phrases removed", count });
    t = t1;
  }

  if (intensity < 3) return { text: cleanup(t), changes };

  // ── Level 3: Contractions + corp speak ────────────────────────────────────
  {
    const { text: t1, count } = applyReplacements(t, CONTRACTION_PAIRS);
    if (count > 0) changes.push({ id: "contractions", label: "Contractions added", count });
    t = t1;
  }
  {
    const { text: t1, count } = applyReplacements(t, CORPSPEAK_PAIRS);
    if (count > 0) changes.push({ id: "corpspeak", label: "Corp-speak simplified", count });
    t = t1;
  }

  if (intensity < 4) return { text: cleanup(t), changes };

  // ── Level 4: Sentence restructuring + intensifiers ────────────────────────
  {
    const before = t;
    t = t.replace(INTENSIFIER_RE, "");
    const count = (before.match(new RegExp(INTENSIFIER_RE.source, "gi")) ?? []).length;
    if (count > 0) changes.push({ id: "intensifiers", label: "Intensifiers removed", count });
  }
  {
    const { text: t1, count } = restructureSentences(t);
    if (count > 0) changes.push({ id: "sentences", label: "Long sentences split", count });
    t = t1;
  }

  if (intensity < 5) return { text: cleanup(t), changes };

  // ── Level 5: Hedging + passive voice ──────────────────────────────────────
  {
    const { text: t1, count } = applyReplacements(t, HEDGE_PAIRS);
    if (count > 0) changes.push({ id: "hedges", label: "Hedging language removed", count });
    t = t1;
  }
  {
    const { text: t1, count } = applyReplacements(t, PASSIVE_PAIRS);
    if (count > 0) changes.push({ id: "passive", label: "Passive voice reduced", count });
    t = t1;
  }

  return { text: cleanup(t), changes };
}

function cleanup(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([.!?,])/g, "$1")
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*,/g, ",")
    .trim();
}
