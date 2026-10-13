"use client";

import { useState } from "react";
import type { Mastery } from "@/lib/rewards";

export type DeckCard = {
  char: string;
  pinyin: string;
  meaning: string;
  correct: number;
  wrong: number;
  mastery: Mastery;
};

const GROUPS: { key: Mastery; label: string; blurb: string; dot: string }[] = [
  { key: "mastered", label: "Mastered", blurb: "Right 3+ times in a row", dot: "bg-good" },
  { key: "iffy", label: "Iffy", blurb: "Missed, not yet 3 right in a row", dot: "bg-bad" },
  { key: "new", label: "Just introduced", blurb: "Still settling in", dot: "bg-muted" },
];

type Filter = Mastery | "all";

/** The learner's characters, sorted into mastered / iffy / just introduced. */
export function HanziDeck({ cards }: { cards: DeckCard[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (m: Mastery) => cards.filter((c) => c.mastery === m).length;
  const visible = GROUPS.filter((g) => filter === "all" || g.key === filter);

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-line px-6 py-10 text-center text-muted">
        Finish your first lesson and your characters will show up here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Share of the deck in each group */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-line" aria-hidden>
        {GROUPS.map((g) => (
          <div key={g.key} className={g.dot} style={{ width: `${(count(g.key) / cards.length) * 100}%` }} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter characters">
        {(["all", ...GROUPS.map((g) => g.key)] as Filter[]).map((f) => {
          const group = GROUPS.find((g) => g.key === f);
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition ${
                active ? "border-ink bg-accent text-on-accent" : "border-line hover:border-ink"
              }`}
            >
              {group && <span className={`h-2.5 w-2.5 rounded-full ${group.dot}`} />}
              {group ? group.label : "All"}
              <span className="tabular-nums opacity-70">{group ? count(group.key) : cards.length}</span>
            </button>
          );
        })}
      </div>

      {visible.map((g) => {
        const groupCards = cards.filter((c) => c.mastery === g.key);
        if (groupCards.length === 0 && filter === "all") return null;
        return (
          <section key={g.key} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${g.dot}`} />
              <h3 className="font-semibold">{g.label}</h3>
              <span className="text-sm text-muted">{g.blurb}</span>
            </div>
            {groupCards.length === 0 ? (
              <p className="text-sm text-muted">Nothing here yet.</p>
            ) : (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {groupCards.map((c) => (
                  <li
                    key={c.char}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 bg-surface px-2 py-3 text-center ${
                      g.key === "mastered" ? "border-good" : g.key === "iffy" ? "border-bad" : "border-line"
                    }`}
                  >
                    <span className="hanzi text-4xl leading-tight">{c.char}</span>
                    <span className="text-sm font-medium">{c.pinyin}</span>
                    <span className="line-clamp-1 text-xs text-muted">{c.meaning}</span>
                    <span className="text-xs text-muted tabular-nums">
                      {c.correct}/{c.correct + c.wrong} right
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
