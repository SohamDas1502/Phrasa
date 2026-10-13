import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { charsThrough, lessons } from "@/data/lessons";
import { LessonPlayer } from "@/components/LessonPlayer";
import { SiteNav } from "@/components/SiteNav";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Learn · Phrasa" };

export default function LearnPage() {
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
        <Suspense fallback={<p className="text-center text-muted">Loading your lesson…</p>}>
          <CurrentLesson />
        </Suspense>
      </main>
    </div>
  );
}

async function CurrentLesson() {
  const user = await requireUser("/learn");
  if (user.lessonIndex >= lessons.length) return <AllDone />;
  return <LessonPlayer key={user.lessonIndex} lessonIndex={user.lessonIndex} />;
}

function AllDone() {
  const known = charsThrough(lessons.length - 1);
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-semibold">You’ve finished every starter lesson</h2>
      <p className="text-muted">You can now read these {known.length} characters:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {known.map((h) => (
          <span
            key={h.char}
            title={`${h.pinyin} · ${h.meaning}`}
            className="hanzi rounded-xl border border-line bg-surface px-3 py-1 text-2xl"
          >
            {h.char}
          </span>
        ))}
      </div>
      <p className="max-w-sm text-muted">More HSK 1 lessons are on the way.</p>
      <Link href="/profile" className="font-semibold underline underline-offset-4">
        See your hanzi deck
      </Link>
    </div>
  );
}
