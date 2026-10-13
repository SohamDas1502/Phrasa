import "server-only";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSessionUserId } from "./session";

/** The narrow user shape that's safe to hand to pages and client components. */
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  coins: number;
  lessonIndex: number;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, coins: true, lessonIndex: true },
  });
}

/** Like getCurrentUser, but sends signed-out visitors to the login page. */
export async function requireUser(next?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}
