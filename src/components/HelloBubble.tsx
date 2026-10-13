"use client";

import { useEffect, useState } from "react";

const GREETINGS = [
  { text: "你好", lang: "zh-CN", className: "hanzi" },
  { text: "Hello", lang: "en", className: "" },
];

/** Speech bubble that switches between 你好 and Hello. */
export function HelloBubble() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % GREETINGS.length), 1800);
    return () => clearInterval(id);
  }, []);

  const greeting = GREETINGS[index];

  return (
    <div className="relative rounded-2xl border-[3px] border-ink bg-surface px-3 py-1.5 shadow-[3px_3px_0_var(--ink)] sm:px-4 sm:py-2 sm:shadow-[4px_4px_0_var(--ink)]">
      <span key={index} lang={greeting.lang} className={`bubble-swap block text-lg font-bold whitespace-nowrap sm:text-xl ${greeting.className}`}>
        {greeting.text}
      </span>
      {/* Tail pointing down at the avatar */}
      <span
        aria-hidden
        className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r-[3px] border-b-[3px] border-ink bg-surface"
      />
    </div>
  );
}
