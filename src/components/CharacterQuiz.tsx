"use client";

import { useState } from "react";
import type { Hanzi } from "@/data/lessons";
import { sample, shuffle } from "@/lib/random";
import { COINS } from "@/lib/rewards";
import { speak } from "@/lib/speech";

type Kind = "meaning" | "pinyin" | "hanzi";

type Question = {
  id: number;
  kind: Kind;
  target: Hanzi;
  options: string[];
};

const label = (h: Hanzi, kind: Kind) =>
  kind === "meaning" ? h.meaning : kind === "pinyin" ? h.pinyin : h.char;

function makeQuestion(id: number, target: Hanzi, kind: Kind, pool: Hanzi[]): Question {
  const answer = label(target, kind);
  // Distinct labels only: 他 and 她 share a pinyin, so one can't be a distractor for the other.
  const distractors = [...new Set(pool.map((h) => label(h, kind)))].filter((l) => l !== answer);
  return { id, kind, target, options: shuffle([answer, ...sample(distractors, 3)]) };
}

function buildQueue(newChars: Hanzi[], reviewChars: Hanzi[], pool: Hanzi[]): Question[] {
  let id = 0;
  const kinds: Kind[] = ["pinyin", "hanzi"];
  const questions = [
    // Every new character twice: once by meaning, once by sound or by sight.
    ...newChars.map((h) => makeQuestion(id++, h, "meaning", pool)),
    ...newChars.map((h, i) => makeQuestion(id++, h, kinds[i % 2], pool)),
    // A few older characters so earlier lessons stay fresh.
    ...sample(reviewChars, 4).map((h) => makeQuestion(id++, h, "meaning", pool)),
  ];
  return shuffle(questions);
}

/** Flashcard-style drill: pick the right answer; misses come back at the end. */
export function CharacterQuiz({
  newChars,
  reviewChars,
  onAnswer,
  onProgress,
  onDone,
}: {
  newChars: Hanzi[];
  reviewChars: Hanzi[];
  onAnswer: (char: string, correct: boolean) => void;
  onProgress: (fraction: number) => void;
  onDone: () => void;
}) {
  const pool = [...newChars, ...reviewChars];
  const [queue, setQueue] = useState(() => buildQueue(newChars, reviewChars, pool));
  const [total] = useState(() => queue.length);
  const [position, setPosition] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = queue[position];
  const answer = label(q.target, q.kind);
  const isRight = picked === answer;

  function pick(option: string) {
    if (picked) return;
    setPicked(option);
    speak(q.target.char);
    onAnswer(q.target.char, option === answer);
    if (option === answer) {
      setCorrect(correct + 1);
      onProgress((correct + 1) / total);
    } else {
      setQueue([...queue, makeQuestion(queue.length, q.target, q.kind, pool)]);
    }
  }

  function next() {
    if (position + 1 >= queue.length) {
      onDone();
      return;
    }
    setPosition(position + 1);
    setPicked(null);
  }

  const prompt =
    q.kind === "hanzi" ? (
      <p className="text-center text-3xl font-semibold">{q.target.meaning}</p>
    ) : (
      <span className="hanzi text-[112px] leading-none">{q.target.char}</span>
    );

  const instruction =
    q.kind === "meaning" ? "What does this mean?" : q.kind === "pinyin" ? "How is this pronounced?" : "Which character is this?";

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted">{instruction}</p>

      <div
        className={`flex min-h-[200px] w-full max-w-sm items-center justify-center rounded-3xl border-2 p-6 shadow-sm transition ${
          picked === null ? "border-line bg-surface" : isRight ? "border-good bg-good/10" : "border-bad bg-bad/10"
        }`}
      >
        {prompt}
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {q.options.map((option) => {
          const state =
            picked === null
              ? "border-line hover:border-accent"
              : option === answer
                ? "border-good bg-good/15 font-semibold text-good"
                : option === picked
                  ? "border-bad bg-bad/15 font-semibold text-bad"
                  : "border-line opacity-50";
          return (
            <button
              key={option}
              type="button"
              onClick={() => pick(option)}
              disabled={picked !== null}
              className={`min-h-16 rounded-2xl border-2 bg-surface px-3 py-3 text-center transition ${state} ${
                q.kind === "hanzi" ? "hanzi text-4xl" : "text-base font-medium"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <p className={`text-center font-medium ${isRight ? "text-good" : "text-bad"}`}>
            {isRight ? `Correct! +${COINS.quizCorrect} coin` : "Not quite. You’ll see this one again."}{" "}
            <span className="hanzi">{q.target.char}</span> · {q.target.pinyin} · {q.target.meaning}
          </p>
          <button
            type="button"
            onClick={next}
            autoFocus
            className="rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
