import { HANZI_BY_CHAR } from "@/data/lessons";
import { isHan } from "./hanzi";

/** "Zhōngguó rén!" -> "zhongguoren": no tones, spaces or punctuation (ü becomes u). */
const bare = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/**
 * Does the pinyin actually spell the characters? Catches the AI writing one
 * character but pronouncing another (e.g. 你好是 with "nǐ hǎo ma").
 * Tones are ignored, so tone changes like 不 bù/bú still match.
 */
export function pinyinMatches(zh: string, pinyin: string): boolean {
  const expected = [...zh].filter(isHan).map((c) => HANZI_BY_CHAR.get(c)?.pinyin);
  if (expected.some((p) => p === undefined)) return false;
  return bare(expected.join("")) === bare(pinyin);
}

/** Pinyin built from our own lesson data, one syllable per character. */
const PUNCT: Record<string, string> = { "，": ",", "。": ".", "？": "?", "！": "!" };

export function pinyinFromLessons(zh: string): string {
  return [...zh]
    .map((c) => (isHan(c) ? (HANZI_BY_CHAR.get(c)?.pinyin ?? c) : (PUNCT[c] ?? c)))
    .join(" ")
    .replace(/ ([,.?!])/g, "$1");
}
