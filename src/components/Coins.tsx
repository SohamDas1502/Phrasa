/** A round coin with a square hole, like traditional Chinese coins. */
export function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="12" cy="12" r="9.5" />
      <rect x="9" y="9" width="6" height="6" rx="0.8" />
    </svg>
  );
}
