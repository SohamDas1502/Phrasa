/** Coins for practice. Awarded on the server when a lesson is finished. */
export const COINS = {
  quizCorrect: 1,
  sentenceCorrect: 2,
  lessonComplete: 10,
} as const;

export type Mastery = "mastered" | "iffy" | "new";

export type CharStatLike = { correct: number; wrong: number; streak: number };

/**
 * Mastered: right 3+ times in a row, and mostly right overall.
 * Iffy: missed at some point and not yet back to 3 in a row (or often missed).
 * New: no misses yet, still being learned.
 */
export function masteryOf({ correct, wrong, streak }: CharStatLike): Mastery {
  const total = correct + wrong;
  const accuracy = total === 0 ? 0 : correct / total;
  if (streak >= 3 && accuracy >= 0.75) return "mastered";
  if (wrong > 0) return "iffy";
  return "new";
}
