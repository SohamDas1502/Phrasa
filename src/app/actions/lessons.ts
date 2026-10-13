"use server";

import { redirect } from "next/navigation";
import { charsThrough, lessons } from "@/data/lessons";
import { db } from "@/lib/db";
import { COINS } from "@/lib/rewards";
import { getSessionUserId } from "@/lib/session";

export type LessonResults = {
  lessonIndex: number;
  /** Every quiz answer in order, including retries. */
  quiz: { char: string; correct: boolean }[];
  /** Every sentence attempt in order, including retries. */
  sentences: boolean[];
};

export type LessonReward = { coinsEarned: number; totalCoins: number; firstCompletion: boolean };

export async function completeLesson(results: LessonResults): Promise<LessonReward> {
  // Re-check the session here rather than trusting the page that called us.
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/learn");

  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { lessonIndex: true, coins: true } });
  const { lessonIndex } = results;
  if (!Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= lessons.length || lessonIndex > user.lessonIndex) {
    throw new Error("That lesson isn't unlocked yet.");
  }

  // Only accept characters this lesson can actually ask about, and cap the counts.
  const allowed = new Set(charsThrough(lessonIndex).map((h) => h.char));
  const quiz = (Array.isArray(results.quiz) ? results.quiz : [])
    .filter((a) => a && allowed.has(a.char) && typeof a.correct === "boolean")
    .slice(0, 80);
  const sentences = (Array.isArray(results.sentences) ? results.sentences : [])
    .filter((s) => typeof s === "boolean")
    .slice(0, 40);

  const quizCorrect = quiz.filter((a) => a.correct).length;
  const sentencesCorrect = sentences.filter(Boolean).length;
  const firstCompletion = lessonIndex === user.lessonIndex;
  const coinsEarned =
    quizCorrect * COINS.quizCorrect +
    sentencesCorrect * COINS.sentenceCorrect +
    (firstCompletion ? COINS.lessonComplete : 0);

  // Replay answers in order on top of the stored stats to get correct streaks.
  const chars = [...new Set(quiz.map((a) => a.char))];
  const existing = await db.charStat.findMany({ where: { userId, char: { in: chars } } });
  const stats = new Map(existing.map((s) => [s.char, { correct: s.correct, wrong: s.wrong, streak: s.streak }]));
  for (const { char, correct } of quiz) {
    const s = stats.get(char) ?? { correct: 0, wrong: 0, streak: 0 };
    if (correct) stats.set(char, { correct: s.correct + 1, wrong: s.wrong, streak: s.streak + 1 });
    else stats.set(char, { correct: s.correct, wrong: s.wrong + 1, streak: 0 });
  }

  const now = new Date();
  const [updated] = await db.$transaction([
    db.user.update({
      // On a first completion, only match if they're still on this lesson, so a
      // double submit can't award the bonus twice (the transaction fails instead).
      where: firstCompletion ? { id: userId, lessonIndex } : { id: userId },
      data: {
        coins: { increment: coinsEarned },
        ...(firstCompletion ? { lessonIndex: lessonIndex + 1 } : {}),
      },
      select: { coins: true },
    }),
    db.lessonCompletion.create({
      data: {
        userId,
        lessonId: lessons[lessonIndex].id,
        quizCorrect,
        quizTotal: quiz.length,
        sentencesCorrect,
        sentencesTotal: sentences.length,
        coinsEarned,
      },
    }),
    ...[...stats].map(([char, s]) =>
      db.charStat.upsert({
        where: { userId_char: { userId, char } },
        create: { userId, char, ...s, firstSeen: now, lastSeen: now },
        update: { ...s, lastSeen: now },
      }),
    ),
  ]);

  return { coinsEarned, totalCoins: updated.coins, firstCompletion };
}
