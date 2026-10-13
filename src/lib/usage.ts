import "server-only";
import { db } from "./db";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Atomically use one unit of a per-user daily allowance (`amount` units at once).
 * Returns false, without counting, once the day's limit is reached.
 */
export async function takeDailyQuota(userId: string, kind: string, limit: number, amount = 1): Promise<boolean> {
  if (amount > limit) return false;
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "DailyUsage" ("userId", "day", "kind", "count")
    VALUES (${userId}, ${today()}, ${kind}, ${amount})
    ON CONFLICT ("userId", "day", "kind")
    DO UPDATE SET "count" = "DailyUsage"."count" + ${amount}
    WHERE "DailyUsage"."count" + ${amount} <= ${limit}
    RETURNING "count"`;
  return rows.length > 0;
}

/** How much of a daily allowance is left, without using any. */
export async function remainingDailyQuota(userId: string, kind: string, limit: number): Promise<number> {
  const row = await db.dailyUsage.findUnique({ where: { userId_day_kind: { userId, day: today(), kind } } });
  return Math.max(0, limit - (row?.count ?? 0));
}
