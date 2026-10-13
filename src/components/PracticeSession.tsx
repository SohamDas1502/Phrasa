"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completePractice, type PracticeReward } from "@/app/actions/practice";
import type { Hanzi, Sentence } from "@/data/lessons";
import { burstCoins } from "@/lib/coinBurst";
import { CoinIcon } from "./Coins";
import { SentenceBuilder } from "./SentenceBuilder";

type Stage = "intro" | "sentences" | "done";

/** One practice round: see today's focus characters, build the sentences, collect coins. */
export function PracticeSession({
  sentences,
  focus,
  known,
  notice,
}: {
  sentences: Sentence[];
  focus: Hanzi[];
  known: Hanzi[];
  notice?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [progress, setProgress] = useState(0);
  const results = useRef<{ zh: string; correct: boolean }[]>([]);

  const [reward, setReward] = useState<PracticeReward | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [saving, startSaving] = useTransition();

  function save() {
    setSaveError(false);
    startSaving(async () => {
      try {
        setReward(await completePractice(results.current));
      } catch {
        setSaveError(true);
      }
    });
  }

  // Coins fly from the reward badge into the header counter, once.
  const rewardRef = useRef<HTMLParagraphElement>(null);
  const burstDone = useRef(false);
  useEffect(() => {
    if (!reward || burstDone.current || !rewardRef.current) return;
    burstDone.current = true;
    burstCoins(rewardRef.current, reward.coinsEarned);
  }, [reward]);

  const overall = stage === "intro" ? 0 : stage === "done" ? 1 : progress;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">Practice</span>
          <span className="text-muted">
            {stage === "intro" ? "Today’s focus" : stage === "done" ? "Round complete" : "Build sentences"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${overall * 100}%` }} />
        </div>
      </div>

      {stage === "intro" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold">Today’s focus</h2>
          <p className="max-w-sm text-muted">
            {sentences.length} fresh sentences using only characters you know, with extra practice on these:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {focus.map((h) => (
              <div key={h.char} className="flex w-24 flex-col items-center gap-1 rounded-2xl border-2 border-ink bg-surface px-2 py-3">
                <span className="hanzi text-4xl leading-tight">{h.char}</span>
                <span className="text-sm font-medium">{h.pinyin}</span>
                <span className="line-clamp-1 text-xs text-muted">{h.meaning}</span>
              </div>
            ))}
          </div>
          {notice && <p className="max-w-sm rounded-xl bg-line/60 px-4 py-2 text-sm text-muted">{notice}</p>}
          <button
            type="button"
            onClick={() => setStage("sentences")}
            autoFocus
            className="w-full max-w-sm rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90"
          >
            Start
          </button>
        </div>
      )}

      {stage === "sentences" && (
        <SentenceBuilder
          sentences={sentences}
          known={known}
          onAnswer={(correct, s) => results.current.push({ zh: s.tokens.join(""), correct })}
          onProgress={setProgress}
          onDone={() => {
            setStage("done");
            save();
          }}
        />
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold">Nice practice!</h2>
          <div className="flex min-h-14 flex-col items-center justify-center gap-2" aria-live="polite">
            {reward ? (
              <>
                <p ref={rewardRef} className="coin-pop inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2 text-xl font-bold">
                  <CoinIcon size={22} />+{reward.coinsEarned} coins
                </p>
                {reward.capped && <p className="text-sm text-muted">You’ve hit today’s practice coin limit. Practice still counts toward mastery!</p>}
              </>
            ) : saveError ? (
              <p className="text-sm font-medium text-bad">
                Couldn’t save your practice.{" "}
                <button type="button" onClick={save} className="underline underline-offset-4">
                  Try again
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted">Counting your coins…</p>
            )}
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <button
              type="button"
              onClick={() => router.refresh()}
              disabled={!reward || saving}
              className="rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-40"
            >
              Practice again
            </button>
            <Link href="/profile" className="rounded-2xl border-2 border-ink px-6 py-3 font-semibold transition hover:bg-ink/5">
              See your hanzi deck
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
