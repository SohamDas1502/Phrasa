import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/Avatar";
import { PracticeSession } from "@/components/PracticeSession";
import { SiteNav } from "@/components/SiteNav";
import { requireUser } from "@/lib/auth";
import { buildPracticeSet } from "@/lib/practice";

export const metadata: Metadata = { title: "Practice · Phrasa" };

export default function PracticePage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col px-4 py-6 sm:py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Phrasa <span className="hanzi text-accent">学</span>
        </Link>
        <Suspense>
          <SiteNav />
        </Suspense>
      </header>

      <main className="flex flex-1 flex-col">
        <Suspense fallback={<Writing />}>
          <Practice />
        </Suspense>
      </main>
    </div>
  );
}

/** Shown while sentences are fetched or written. */
function Writing() {
  return (
    <div className="flex flex-col items-center gap-4 pt-10 text-center">
      <div className="w-24">
        <Avatar className="h-auto w-full" />
      </div>
      <p className="text-muted">Your avatar is writing sentences for you…</p>
    </div>
  );
}

async function Practice() {
  const user = await requireUser("/practice");
  if (user.lessonIndex === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Finish Lesson 1 first</h2>
        <p className="max-w-sm text-muted">Practice builds sentences from characters you’ve learned, so start with your first lesson.</p>
        <Link href="/learn" className="rounded-2xl bg-accent px-6 py-3 font-semibold text-on-accent">
          Go to Lesson 1
        </Link>
      </div>
    );
  }
  const set = await buildPracticeSet(user);
  return <PracticeSession key={set.id} sentences={set.sentences} focus={set.focus} known={set.known} notice={set.notice} />;
}
