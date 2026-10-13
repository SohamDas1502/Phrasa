import Link from "next/link";
import { lessons } from "@/data/lessons";
import { getCurrentUser } from "@/lib/auth";

const PRIMARY =
  "inline-flex min-w-36 items-center justify-center rounded-2xl border-2 border-ink bg-accent px-8 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90";
const SECONDARY =
  "inline-flex min-w-36 items-center justify-center rounded-2xl border-2 border-ink px-8 py-4 text-lg font-semibold transition hover:bg-ink/5";

/** Sign up / Log in for visitors. Also the static fallback while the session loads. */
export function StartLinkFallback() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link href="/signup" className={PRIMARY}>
        Sign up
      </Link>
      <Link href="/login" className={SECONDARY}>
        Log in
      </Link>
    </div>
  );
}

/** Visitors get Sign up / Log in; signed-in learners get straight back to their lesson. Render inside <Suspense>. */
export async function StartLink() {
  const user = await getCurrentUser();
  if (!user) return <StartLinkFallback />;

  const label =
    user.lessonIndex === 0
      ? "Start learning"
      : user.lessonIndex >= lessons.length
        ? "Review lessons"
        : `Continue · Lesson ${user.lessonIndex + 1}`;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link href="/learn" className={PRIMARY}>
        {label}
      </Link>
      <Link href="/profile" className={SECONDARY}>
        Profile
      </Link>
    </div>
  );
}
