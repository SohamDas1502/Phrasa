import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/Avatar";
import { CoinIcon } from "@/components/Coins";
import { HanziDeck, type DeckCard } from "@/components/HanziDeck";
import { SiteNav } from "@/components/SiteNav";
import { HANZI_BY_CHAR as HANZI, lessons } from "@/data/lessons";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { masteryOf } from "@/lib/rewards";

export const metadata: Metadata = { title: "Your profile · Phrasa" };

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

export default function ProfilePage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:py-10">
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Phrasa <span className="hanzi text-accent">学</span>
        </Link>
        <Suspense>
          <SiteNav />
        </Suspense>
      </header>

      <main className="flex flex-1 flex-col">
        <Suspense fallback={<p className="text-center text-muted">Loading your profile…</p>}>
          <Profile />
        </Suspense>
      </main>
    </div>
  );
}

async function Profile() {
  const user = await requireUser("/profile");
  const [account, stats, completions] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.id }, select: { createdAt: true } }),
    db.charStat.findMany({ where: { userId: user.id }, orderBy: { lastSeen: "desc" } }),
    db.lessonCompletion.findMany({ where: { userId: user.id }, orderBy: { completedAt: "asc" } }),
  ]);

  const deck: DeckCard[] = stats.flatMap((s) => {
    const h = HANZI.get(s.char);
    return h ? [{ char: s.char, pinyin: h.pinyin, meaning: h.meaning, correct: s.correct, wrong: s.wrong, mastery: masteryOf(s) }] : [];
  });
  const mastered = deck.filter((c) => c.mastery === "mastered").length;

  const firstDone = new Map<number, Date>();
  for (const c of completions) if (!firstDone.has(c.lessonId)) firstDone.set(c.lessonId, c.completedAt);
  const lessonsDone = Math.min(user.lessonIndex, lessons.length);

  return (
    <div className="flex flex-col gap-12">
      {/* Who */}
      <section className="flex items-end gap-5">
        <div className="w-24 shrink-0 sm:w-28">
          <Avatar className="h-auto w-full" />
        </div>
        <div className="flex flex-1 flex-col gap-1 pb-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{user.name}</h1>
          <p className="text-sm text-muted">Learning since {dateFormat.format(account.createdAt)}</p>
        </div>
        <form action={logout} className="pb-2">
          <button type="submit" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            Log out
          </button>
        </form>
      </section>

      {/* Dashboard */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Lessons done" value={`${lessonsDone}/${lessons.length}`} />
        <Stat label="Characters seen" value={String(deck.length)} />
        <Stat label="Mastered" value={String(mastered)} />
        <Stat
          label="Coins"
          value={
            <span className="inline-flex items-center gap-2">
              <CoinIcon size={24} />
              {user.coins.toLocaleString()}
            </span>
          }
        />
      </section>

      {/* Lessons */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Lessons</h2>
        <ol className="flex flex-col divide-y-2 divide-line rounded-2xl border-2 border-line">
          {lessons.map((lesson, i) => {
            const doneAt = firstDone.get(lesson.id);
            const done = i < user.lessonIndex;
            const current = i === user.lessonIndex;
            return (
              <li key={lesson.id} className={`flex items-center gap-4 px-4 py-3 ${!done && !current ? "opacity-45" : ""}`}>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    done ? "border-good bg-good text-on-accent" : current ? "border-ink" : "border-line"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : lesson.id}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold">{lesson.title}</span>
                  <span className="hanzi truncate text-sm text-muted">{lesson.chars.map((h) => h.char).join(" ")}</span>
                </div>
                {done ? (
                  <span className="shrink-0 text-sm text-muted">{doneAt ? dateFormat.format(doneAt) : "Done"}</span>
                ) : current ? (
                  <Link
                    href="/learn"
                    className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-on-accent transition hover:opacity-90"
                  >
                    {i === 0 ? "Start" : "Continue"}
                  </Link>
                ) : (
                  <span className="shrink-0 text-sm text-muted">Locked</span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Hanzi deck */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Hanzi deck</h2>
          {deck.length > 0 && (
            <Link
              href="/practice"
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-on-accent transition hover:opacity-90"
            >
              Practice these
            </Link>
          )}
        </div>
        <HanziDeck cards={deck} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border-2 border-ink bg-surface p-4 shadow-[4px_4px_0_var(--ink)]">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-3xl font-bold tabular-nums">{value}</span>
    </div>
  );
}
