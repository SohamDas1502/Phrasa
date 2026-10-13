import "server-only";
import type { Hanzi, Sentence } from "@/data/lessons";
import { lessons } from "@/data/lessons";
import { AiError, aiConfigured, chatJSON } from "./ai";
import type { CurrentUser } from "./auth";
import { db } from "./db";
import { hanziIn, isHan, unknownHanzi } from "./hanzi";
import { knownChars, lessonSentences } from "./learner";
import { masteryOf } from "./rewards";
import { shuffle } from "./random";
import { takeDailyQuota } from "./usage";

const SET_SIZE = 6;
const FOCUS_SIZE = 3;
/** AI generation calls per learner per day (each call makes up to 8 sentences). */
const GENERATIONS_PER_DAY = 12;

const HANZI = new Map<string, Hanzi>(lessons.flatMap((l) => l.chars.map((h) => [h.char, h] as const)));

export type PracticeSet = {
  /** A fresh id per round, so the client resets on "Practice again". */
  id: string;
  sentences: Sentence[];
  focus: Hanzi[];
  /** Every character the learner knows (for decoy tiles). */
  known: Hanzi[];
  /** Set when the AI couldn't help and lesson sentences filled in. */
  notice?: string;
};

/** Iffy characters first, then new ones, then mastered ones not seen for a while. */
async function pickFocus(userId: string, known: Set<string>): Promise<string[]> {
  const stats = await db.charStat.findMany({ where: { userId, char: { in: [...known] } }, orderBy: { lastSeen: "asc" } });
  const rank = { iffy: 0, new: 1, mastered: 2 } as const;
  const ranked = stats
    .map((s) => ({ char: s.char, rank: rank[masteryOf(s)], lastSeen: s.lastSeen.getTime() }))
    .sort((a, b) => a.rank - b.rank || a.lastSeen - b.lastSeen)
    .map((s) => s.char);
  // Known characters with no stats yet count as new.
  const unseen = [...known].filter((c) => !ranked.includes(c));
  return [...ranked, ...unseen].slice(0, FOCUS_SIZE);
}

type Generated = { tokens: string[]; punct: string; pinyin: string; en: string };

const SENTENCE_SCHEMA = {
  type: "object",
  properties: {
    sentences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tokens: { type: "array", items: { type: "string" } },
          punct: { type: "string", enum: ["。", "？", "！"] },
          pinyin: { type: "string" },
          en: { type: "string" },
        },
        required: ["tokens", "punct", "pinyin", "en"],
        additionalProperties: false,
      },
    },
  },
  required: ["sentences"],
  additionalProperties: false,
};

/** Keep only sentences that are well-formed and use nothing but known characters. */
export function validSentence(s: Generated, known: Set<string>): Sentence | null {
  if (!Array.isArray(s.tokens) || s.tokens.length < 2 || s.tokens.length > 8) return null;
  const tokens = s.tokens.map((t) => String(t).trim());
  if (tokens.some((t) => t.length < 1 || t.length > 4 || ![...t].every(isHan))) return null;
  const zh = tokens.join("");
  if (zh.length > 14 || unknownHanzi(zh, known).length > 0) return null;
  if (!["。", "？", "！"].includes(s.punct)) return null;
  const pinyin = String(s.pinyin ?? "").trim();
  const en = String(s.en ?? "").trim();
  if (!pinyin || !en || pinyin.length > 100 || en.length > 100) return null;
  return { tokens, punct: s.punct as Sentence["punct"], pinyin, en };
}

async function generateSentences(known: Set<string>, focus: string[]): Promise<Sentence[]> {
  const { sentences } = await chatJSON<{ sentences: Generated[] }>({
    name: "practice_sentences",
    schema: SENTENCE_SCHEMA,
    temperature: 0.9,
    messages: [
      {
        role: "system",
        content:
          "You write practice sentences for a beginner learning Mandarin Chinese (simplified characters). " +
          "You follow the allowed-character rule exactly: a sentence with any other character is useless to the learner.",
      },
      {
        role: "user",
        content: [
          `Allowed characters (use ONLY these, no others, not even very common ones): ${[...known].join(" ")}`,
          `Write 8 different, natural, grammatical short sentences.`,
          `Every sentence must use at least one of these focus characters: ${focus.join(" ")}.`,
          `Split each sentence into tokens the way a learner would arrange word tiles: multi-character words stay together (for example 中国, 学生, 朋友, 什么), everything else is one character per token. Tokens contain no punctuation.`,
          `Give tone-marked pinyin for the whole sentence and a natural English translation.`,
          `punct is the sentence-ending mark: 。 or ？ or ！.`,
        ].join("\n"),
      },
    ],
  });
  return (Array.isArray(sentences) ? sentences : []).map((s) => validSentence(s, known)).filter((s): s is Sentence => s !== null);
}

const toSentence = (r: { tokens: string[]; punct: string; pinyin: string; en: string }): Sentence => ({
  tokens: r.tokens,
  punct: r.punct as Sentence["punct"],
  pinyin: r.pinyin,
  en: r.en,
});

export async function buildPracticeSet(user: CurrentUser): Promise<PracticeSet> {
  const known = knownChars(user.lessonIndex);
  const focus = await pickFocus(user.id, known);
  const knownArr = [...known];
  const hasFocus = (s: Sentence) => s.tokens.some((t) => [...t].some((c) => focus.includes(c)));

  // 1. Reuse stored sentences the learner can fully read that hit a focus character.
  const stored = await db.$queryRaw<{ tokens: string[]; punct: string; pinyin: string; en: string }[]>`
    SELECT "tokens", "punct", "pinyin", "en" FROM "PracticeSentence"
    WHERE "chars" <@ ${knownArr}::text[] AND "chars" && ${focus}::text[]
    ORDER BY random() LIMIT ${SET_SIZE}`;
  const picked: Sentence[] = stored.map(toSentence);

  // 2. Not enough? Ask the AI for more, store the good ones for everyone.
  let notice: string | undefined;
  if (picked.length < SET_SIZE) {
    try {
      if (!aiConfigured()) throw new AiError("not_configured", "no key");
      if (!(await takeDailyQuota(user.id, "ai_practice", GENERATIONS_PER_DAY))) {
        throw new AiError("rate_limited", "daily practice generation limit");
      }
      const fresh = await generateSentences(known, focus);
      if (fresh.length > 0) {
        await db.practiceSentence.createMany({
          data: fresh.map((s) => ({ ...s, zh: s.tokens.join(""), chars: hanziIn(s.tokens.join("")) })),
          skipDuplicates: true,
        });
      }
      const have = new Set(picked.map((s) => s.tokens.join("")));
      for (const s of fresh.filter(hasFocus)) {
        if (picked.length >= SET_SIZE) break;
        const zh = s.tokens.join("");
        if (have.has(zh)) continue;
        picked.push(s);
        have.add(zh);
      }
    } catch (e) {
      if (!(e instanceof AiError)) throw e;
      notice =
        e.kind === "rate_limited"
          ? "Your avatar is resting after a lot of writing, so today’s extra practice comes from your lessons."
          : "AI practice isn’t available right now, so this round uses sentences from your lessons.";
    }
  }

  // 3. Still short? Fill from finished lessons, focus sentences first.
  if (picked.length < SET_SIZE) {
    const have = new Set(picked.map((s) => s.tokens.join("")));
    const fallback = shuffle(lessonSentences(user.lessonIndex)).filter((s) => !have.has(s.tokens.join("")));
    fallback.sort((a, b) => Number(hasFocus(b)) - Number(hasFocus(a)));
    picked.push(...fallback.slice(0, SET_SIZE - picked.length));
  }

  return {
    id: crypto.randomUUID(),
    sentences: shuffle(picked),
    known: [...known].map((c) => HANZI.get(c)).filter((h): h is Hanzi => Boolean(h)),
    focus: focus.map((c) => HANZI.get(c)).filter((h): h is Hanzi => Boolean(h)),
    notice,
  };
}
