"use client";

import { useState } from "react";
import type { Hanzi } from "@/data/lessons";
import { speak } from "@/lib/speech";
import { SpeakButton } from "./SpeakButton";
import { StrokeAnimation } from "./StrokeAnimation";

/** One side of the flip card; both sides share a grid cell so the card sizes to the taller one. */
const FACE =
  "col-start-1 row-start-1 flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-line bg-surface p-8 shadow-sm backface-hidden";

/** Introduces each new character: tap to flip, see meaning + strokes, then move on. */
export function Flashcards({
  chars,
  onProgress,
  onDone,
}: {
  chars: Hanzi[];
  onProgress: (fraction: number) => void;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = chars[index];

  function flip() {
    if (flipped) return;
    setFlipped(true);
    speak(card.char);
  }

  function next() {
    if (index + 1 >= chars.length) {
      onDone();
      return;
    }
    onProgress((index + 1) / chars.length);
    setIndex(index + 1);
    setFlipped(false);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted">
        New character {index + 1} of {chars.length}
      </p>

      {/* Keyed by index so a new card mounts face-up instead of animating back. */}
      <div
        key={index}
        role="button"
        tabIndex={0}
        onClick={flip}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && flip()}
        aria-label={flipped ? undefined : "Reveal meaning"}
        className="w-full max-w-sm cursor-pointer perspective-distant"
      >
        <div
          className={`grid transition-transform duration-500 ease-out transform-3d motion-reduce:transition-none ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          <div className={`${FACE} gap-4`}>
            <span className="hanzi text-[128px] leading-none">{card.char}</span>
            <span className="text-sm text-muted">Tap to reveal</span>
          </div>

          <div className={`${FACE} gap-4 rotate-y-180`} aria-hidden={!flipped}>
            {flipped ? <StrokeAnimation char={card.char} size={150} /> : <div className="size-[150px]" />}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-medium text-accent">{card.pinyin}</span>
              <SpeakButton text={card.char} />
            </div>
            <p className="text-center text-xl font-semibold">{card.meaning}</p>
            {card.note && <p className="text-center text-sm text-muted">{card.note}</p>}
            {card.example && (
              <p className="rounded-xl bg-bg px-4 py-2 text-center text-sm">
                <span className="hanzi text-lg">{card.example.word}</span>{" "}
                <span className="text-muted">
                  {card.example.pinyin} · {card.example.meaning}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={flipped ? next : flip}
        className="w-full max-w-sm rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-on-accent transition hover:opacity-90"
      >
        {flipped ? (index + 1 === chars.length ? "Start practice" : "Next") : "Reveal"}
      </button>
    </div>
  );
}
