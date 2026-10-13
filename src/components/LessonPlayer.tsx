"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeLesson, type LessonResults, type LessonReward } from "@/app/actions/lessons";
import { charsThrough, lessons } from "@/data/lessons";
import { burstCoins } from "@/lib/coinBurst";
import { CoinIcon } from "./Coins";
import { CharacterQuiz } from "./CharacterQuiz";
import { Flashcards } from "./Flashcards";
import { SentenceBuilder } from "./SentenceBuilder";

const STAGES = ["cards", "quiz", "sentences", "done"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_LABEL: Record<Stage, string> = {
  cards: "New characters",
  quiz: "Flashcard round",
  sentences: "Build sentences",
  done: "Lesson complete",
};

export function LessonPlayer({ lessonIndex }: { lessonIndex: number }) {
  const lesson = lessons[lessonIndex];
  const known = charsThrough(lessonIndex);
  const review = charsThrough(lessonIndex - 1);

  const [stage, setStage] = useState<Stage>("cards");
  const [stageProgress, setStageProgress] = useState(0);
  const results = useRef<LessonResults>({ lessonIndex, quiz: [], sentences: [] });

  const [reward, setReward] = useState<LessonReward | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [saving, startSaving] = useTransition();

  const stageIndex = STAGES.indexOf(stage);
  const overall = stage === "done" ? 1 : (stageIndex + stageProgress) / 3;

  function goTo(next: Stage) {
    setStage(next);
    setStageProgress(0);
  }

  function save() {
    setSaveError(false);
    startSaving(async () => {
      try {
        setReward(await completeLesson(results.current));
      } catch {
        setSaveError(true);
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">
            Lesson {lesson.id} · {lesson.title}
          </span>
          <span className="text-muted">{STAGE_LABEL[stage]}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${overall * 100}%` }} />
        </div>
      </div>

      {stage === "cards" && (
        <Flashcards chars={lesson.chars} onProgress={setStageProgress} onDone={() => goTo("quiz")} />
      )}
      {stage === "quiz" && (
        <CharacterQuiz
          newChars={lesson.chars}
          reviewChars={review}
          onAnswer={(char, correct) => results.current.quiz.push({ char, correct })}
          onProgress={setStageProgress}
          onDone={() => goTo("sentences")}
        />
      )}
      {stage === "sentences" && (
        <SentenceBuilder
          sentences={lesson.sentences}
          known={known}
          onAnswer={(correct) => results.current.sentences.push(correct)}
          onProgress={setStageProgress}
          onDone={() => {
            goTo("done");
            save();
          }}
        />
      )}
      {stage === "done" && (
        <LessonComplete
          lessonIndex={lessonIndex}
          reward={reward}
          saving={saving}
          saveError={saveError}
          onRetry={save}
        />
      )}
    </div>
  );
}

function LessonComplete({
  lessonIndex,
  reward,
  saving,
  saveError,
  onRetry,
}: {
  lessonIndex: number;
  reward: LessonReward | null;
  saving: boolean;
  saveError: boolean;
  onRetry: () => void;
}) {
  const router = useRouter();
  const lesson = lessons[lessonIndex];

  // Spray the reward out of the badge and into the header counter, once.
  const rewardRef = useRef<HTMLParagraphElement>(null);
  const burstDone = useRef(false);
  useEffect(() => {
    if (!reward || burstDone.current || !rewardRef.current) return;
    burstDone.current = true;
    burstCoins(rewardRef.current, reward.coinsEarned);
  }, [reward]);
  const total = charsThrough(lessonIndex).length;
  const isLast = lessonIndex + 1 >= lessons.length;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-semibold">Lesson {lesson.id} complete</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {lesson.chars.map((h) => (
          <span key={h.char} className="hanzi rounded-xl border border-line bg-surface px-3 py-1 text-3xl">
            {h.char}
          </span>
        ))}
      </div>
      <p className="text-muted">
        You know {total} characters and can read {lesson.sentences.length} new sentences.
      </p>

      <div className="flex min-h-14 items-center justify-center" aria-live="polite">
        {reward ? (
          <p ref={rewardRef} className="coin-pop inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2 text-xl font-bold">
            <CoinIcon size={22} />+{reward.coinsEarned} coins
          </p>
        ) : saveError ? (
          <p className="text-sm font-medium text-bad">
            Couldn’t save your progress.{" "}
            <button type="button" onClick={onRetry} className="underline underline-offset-4">
              Try again
            </button>
          </p>
        ) : (
          <p className="text-sm text-muted">Counting your coins…</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.refresh()}
        disabled={!reward || saving}
        autoFocus
        className="w-full max-w-sm rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-40"
      >
        {isLast ? "Finish" : "Next lesson"}
      </button>
    </div>
  );
}
