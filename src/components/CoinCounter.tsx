"use client";

import { useEffect, useRef, useState } from "react";
import { CoinIcon } from "./Coins";

/** Fired by the coin burst each time a flying coin lands on the counter. */
export const COIN_HIT_EVENT = "phrasa:coin-hit";

/**
 * The header coin counter. Starts at the server's total and ticks up as burst
 * coins land on it. Give it `key={coins}` so a fresh server total resets it.
 */
export function CoinCounter({ coins }: { coins: number }) {
  const [added, setAdded] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onHit = (e: Event) => {
      setAdded((n) => n + (e as CustomEvent<number>).detail);
      ref.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
        { duration: 180, easing: "ease-out" },
      );
    };
    window.addEventListener(COIN_HIT_EVENT, onHit);
    return () => window.removeEventListener(COIN_HIT_EVENT, onHit);
  }, []);

  const total = coins + added;
  return (
    <span
      ref={ref}
      data-coin-counter
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-3 py-1 text-sm font-bold tabular-nums"
      title={`${total} coins`}
    >
      <CoinIcon size={16} />
      {total.toLocaleString()}
      <span className="sr-only">coins</span>
    </span>
  );
}
