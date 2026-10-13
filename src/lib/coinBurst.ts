import { COIN_HIT_EVENT } from "@/components/CoinCounter";

const MAX_COINS = 24;
const COIN_SIZE = 28;

const COIN_SVG = `<svg viewBox="0 0 24 24" width="${COIN_SIZE}" height="${COIN_SIZE}" aria-hidden="true">
  <circle cx="12" cy="12" r="10.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="2.2"/>
  <rect x="9" y="9" width="6" height="6" rx="0.8" fill="none" stroke="var(--ink)" stroke-width="2.2"/>
</svg>`;

function hit(amount: number) {
  window.dispatchEvent(new CustomEvent(COIN_HIT_EVENT, { detail: amount }));
}

/** The visible coin counter (hidden, kept-alive pages can hold copies too). */
function findCounter(): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>("[data-coin-counter]");
  return [...all].find((el) => el.offsetParent !== null) ?? null;
}

const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

/**
 * Sprays coins out from `origin` in every direction, then flies them one by one
 * into the header coin counter. Each landing coin adds its share to the counter,
 * so the total ticks up to exactly `amount`.
 */
export function burstCoins(origin: HTMLElement, amount: number) {
  if (amount <= 0) return;
  const target = findCounter();
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hit(amount);
    return;
  }

  const count = Math.min(amount, MAX_COINS);
  const from = center(origin.getBoundingClientRect());

  for (let i = 0; i < count; i++) {
    // Split the amount across coins; earlier coins carry any remainder.
    const value = Math.floor(amount / count) + (i < amount % count ? 1 : 0);

    const coin = document.createElement("div");
    coin.innerHTML = COIN_SVG;
    Object.assign(coin.style, {
      position: "fixed",
      left: `${from.x - COIN_SIZE / 2}px`,
      top: `${from.y - COIN_SIZE / 2}px`,
      zIndex: "50",
      pointerEvents: "none",
      willChange: "transform",
    });
    document.body.appendChild(coin);

    // 1. Spray out: evenly spread angles with a little jitter.
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const distance = 70 + Math.random() * 90;
    const out = { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    const spin = (Math.random() - 0.5) * 540;

    const spray = coin.animate(
      [
        { transform: "translate(0, 0) scale(0.3) rotate(0deg)", opacity: 0 },
        { transform: `translate(${out.x}px, ${out.y}px) scale(1) rotate(${spin}deg)`, opacity: 1 },
      ],
      { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
    );

    spray.finished
      .then(() => {
        // 2. Fly to the counter, one after another. Re-measure in case the page moved.
        const to = center((findCounter() ?? target).getBoundingClientRect());
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        // Bow the path a little so the coins swoop rather than slide.
        const mid = { x: (out.x + dx) / 2 + (out.y - dy) * 0.15, y: (out.y + dy) / 2 - 40 };
        const fly = coin.animate(
          [
            { transform: `translate(${out.x}px, ${out.y}px) scale(1) rotate(${spin}deg)` },
            { transform: `translate(${mid.x}px, ${mid.y}px) scale(0.9) rotate(${spin / 2}deg)`, offset: 0.5 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.55) rotate(0deg)` },
          ],
          { duration: 620, delay: 180 + i * 55, easing: "cubic-bezier(0.55, 0, 0.75, 0.2)", fill: "forwards" },
        );
        return fly.finished;
      })
      .then(() => hit(value))
      .catch(() => hit(value))
      .finally(() => coin.remove());
  }
}
