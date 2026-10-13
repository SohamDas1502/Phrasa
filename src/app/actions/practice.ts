"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hanziIn } from "@/lib/hanzi";
import { knownChars, lessonSentences } from "@/lib/learner";
import { COINS } from "@/lib/rewards";
import { getSessionUserId } from "@/lib/session";
import { remainingDailyQuota, takeDailyQuota } from "@/lib/usage";

/** Coins from practice are capped per day so it can't be farmed. */
const PRACTICE_COINS_PER_DAY = 100;

export type PracticeReward = { coinsEarned: number; totalCoins: number; capped: boolean };

export async function completePractice(results: { zh: string; correct: boolean }[]): Promise<PracticeReward> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/practice");
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { lessonIndex: true, coins: true } });
  const known = knownChars(user.lessonIndex);

  // Only credit real sentences the learner can read: stored practice ones or lesson ones.
  const attempts = (Array.isArray(results) ? results : [])
    .filter((r) => r && typeof r.zh === "string" && typeof r.correct === "boolean")
    .slice(0, 40);
  const zhs = [...new Set(attempts.map((r) => r.zh))];
  const stored = await db.practiceSentence.findMany({ where: { zh: { in: zhs } }, select: { zh: true } });
  const real = new Set([...stored.map((s) => s.zh), ...lessonSentences(user.lessonIndex).map((s) => s.tokens.join(""))]);
  const readable = (zh: string) => real.has(zh) && hanziIn(zh).every((c) => known.has(c));

  const solved = [...new Set(attempts.filter((r) => r.correct && readable(r.zh)).map((r) => r.zh))];

  let coins = solved.length * COINS.sentenceCorrect;
  const left = await remainingDailyQuota(userId, "practice_coins", PRACTICE_COINS_PER_DAY);
  const capped = coins > left;
  coins = Math.min(coins, left);
  if (coins > 0 && !(await takeDailyQuota(userId, "practice_coins", PRACTICE_COINS_PER_DAY, coins))) coins = 0;

  // Each solved sentence counts as a correct answer for every character in it.
  const credit = new Map<string, number>();
  for (const zh of solved) for (const c of hanziIn(zh)) credit.set(c, (credit.get(c) ?? 0) + 1);
  const existing = await db.charStat.findMany({ where: { userId, char: { in: [...credit.keys()] } } });
  const byChar = new Map(existing.map((s) => [s.char, s]));
  const now = new Date();

  const [updated] = await db.$transaction([
    db.user.update({ where: { id: userId }, data: { coins: { increment: coins } }, select: { coins: true } }),
    ...[...credit].map(([char, n]) => {
      const s = byChar.get(char) ?? { correct: 0, wrong: 0, streak: 0 };
      return db.charStat.upsert({
        where: { userId_char: { userId, char } },
        create: { userId, char, correct: n, wrong: 0, streak: n, firstSeen: now, lastSeen: now },
        update: { correct: s.correct + n, streak: s.streak + n, lastSeen: now },
      });
    }),
  ]);

  return { coinsEarned: coins, totalCoins: updated.coins, capped };
}
