"use client";

import { useEffect, useRef } from "react";
import HanziWriter from "hanzi-writer";

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Loops the stroke-order animation for one character. */
export function StrokeAnimation({ char, size = 160 }: { char: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const writer = HanziWriter.create(el, char, {
      width: size,
      height: size,
      padding: 8,
      strokeColor: cssVar("--ink"),
      outlineColor: cssVar("--line"),
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 180,
      delayBetweenLoops: 1600,
    });
    writer.loopCharacterAnimation();
    return () => {
      writer.pauseAnimation();
      el.innerHTML = "";
    };
  }, [char, size]);

  return <div ref={ref} style={{ width: size, height: size }} aria-hidden />;
}
