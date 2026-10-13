"use client";

import { useState } from "react";
import type { Hanzi, Sentence } from "@/data/lessons";
import { sample, shuffle } from "@/lib/random";
import { COINS } from "@/lib/rewards";
import { speak } from "@/lib/speech";
import { SpeakButton } from "./SpeakButton";

type Tile = { id: number; text: string };

function makeTiles(sentence: Sentence, known: Hanzi[]): Tile[] {
  const used = new Set(sentence.tokens.join(""));
  const extras = sample(
    known.map((h) => h.char).filter((c) => !used.has(c)),
    2,
  );
  return shuffle([...sentence.tokens, ...extras]).map((text, id) => ({ id, text }));
}

/** Read the English, tap the hanzi tiles into the right order. */
export function SentenceBuilder({
  sentences,
  known,
  onAnswer,
  onProgress,
  onDone,
}: {
  sentences: Sentence[];
  known: Hanzi[];
  onAnswer: (correct: boolean, sentence: Sentence) => void;
  onProgress: (fraction: number) => void;
  onDone: () => void;
}) {
  const [queue, setQueue] = useState(() => shuffle(sentences));
  const [position, setPosition] = useState(0);
  const [tiles, setTiles] = useState(() => makeTiles(queue[0], known));
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);

  const sentence = queue[position];
  const answer = sentence.tokens.join("");
  const bank = tiles.filter((t) => !placed.some((p) => p.id === t.id));

  function check() {
    const ok = placed.map((t) => t.text).join("") === answer;
    setResult(ok ? "right" : "wrong");
    speak(answer);
    onAnswer(ok, sentence);
    if (ok) {
      setCorrect(correct + 1);
      onProgress((correct + 1) / sentences.length);
    } else {
      setQueue([...queue, sentence]);
    }
  }

  function next() {
    if (position + 1 >= queue.length) {
      onDone();
      return;
    }
    setPosition(position + 1);
    setTiles(makeTiles(queue[position + 1], known));
    setPlaced([]);
    setResult(null);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted">Build this sentence in Chinese</p>
      <p className="text-center text-2xl font-semibold">{sentence.en}</p>

      {/* Answer line */}
      <div className="flex min-h-20 w-full max-w-md flex-wrap items-center justify-center gap-2 border-b-2 border-line pb-3">
        {placed.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={result !== null}
            onClick={() => setPlaced(placed.filter((p) => p.id !== t.id))}
            className={`hanzi rounded-xl border-2 px-4 py-2 text-3xl ${
              result === null
                ? "border-accent bg-surface"
                : result === "right"
                  ? "border-good bg-good/15 text-good"
                  : "border-bad bg-bad/15 text-bad"
            }`}
          >
            {t.text}
          </button>
        ))}
        {placed.length > 0 && <span className="hanzi text-3xl text-muted">{sentence.punct}</span>}
      </div>

      {/* Tile bank */}
      <div className="flex min-h-16 w-full max-w-md flex-wrap justify-center gap-2">
        {bank.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={result !== null}
            onClick={() => setPlaced([...placed, t])}
            className="hanzi rounded-xl border-2 border-line bg-surface px-4 py-2 text-3xl shadow-sm transition hover:border-accent disabled:opacity-50"
          >
            {t.text}
          </button>
        ))}
      </div>

      {result === null ? (
        <button
          type="button"
          onClick={check}
          disabled={placed.length === 0}
          className="w-full max-w-md rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <div className="flex w-full max-w-md flex-col gap-3">
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 ${
              result === "right" ? "border-good bg-good/10" : "border-bad bg-bad/10"
            }`}
          >
            <div>
              <p className={`font-semibold ${result === "right" ? "text-good" : "text-bad"}`}>
                {result === "right" ? `Correct! +${COINS.sentenceCorrect} coins` : "Correct answer:"}
              </p>
              <p className="hanzi text-2xl">
                {answer}
                {sentence.punct}
              </p>
              <p className="text-sm text-muted">{sentence.pinyin}</p>
            </div>
            <SpeakButton text={answer} />
          </div>
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
