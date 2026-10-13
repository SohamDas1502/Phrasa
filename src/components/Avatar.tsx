export type AvatarPose = "idle" | "entering" | "waving";

/**
 * The learner's block buddy. Drawn in layers (shadow, body, face, limbs) so
 * store items like hats, outfits and colours can be slotted in later.
 *
 * Limbs carry data-part attributes so a parent can animate them (e.g. the entrance).
 */
export function Avatar({
  pose = "idle",
  blinking = false,
  className,
}: {
  pose?: AvatarPose;
  blinking?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Your Phrasa avatar waving hello"
      className={`overflow-visible ${className ?? ""}`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g fill="var(--surface)" stroke="var(--ink)" strokeWidth="5">
        <rect data-part="foot-left" className="avatar-limb" x="62" y="160" width="30" height="16" rx="8" />
        <rect data-part="foot-right" className="avatar-limb" x="110" y="160" width="30" height="16" rx="8" />
      </g>

      <g data-part="body" className={pose === "entering" ? "avatar-body" : "avatar-body avatar-bob"}>
        {/* Left arm, hanging from the shoulder */}
        <g data-part="arm-left" className="avatar-shoulder-left">
          <rect x="22" y="86" width="18" height="52" rx="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="5" />
        </g>

        {/* Right arm: drawn raised. Hangs during the entrance, lifts to wave, then rests at its side. */}
        <g
          data-part="arm-right"
          className={`avatar-shoulder-right ${pose === "waving" ? "avatar-wave" : pose === "idle" ? "avatar-arm-rest" : ""}`}
        >
          <rect
            x="166"
            y="40"
            width="18"
            height="56"
            rx="9"
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth="5"
            transform="rotate(40 175 96)"
          />
        </g>

        {/* Block body with a solid offset shadow for depth */}
        <rect x="58" y="38" width="108" height="118" rx="20" fill="var(--ink)" />
        <rect x="46" y="30" width="108" height="118" rx="20" fill="var(--surface)" stroke="var(--ink)" strokeWidth="5" />

        {/* Happy eyes; a blink snaps them flat for a moment */}
        <g fill="none" stroke="var(--ink)" strokeWidth="5">
          {blinking ? (
            <>
              <path d="M70 72 H89" />
              <path d="M111 72 H131" />
            </>
          ) : (
            <>
              <path d="M70 76 Q79 62 89 74" />
              <path d="M111 74 Q121 62 131 76" />
            </>
          )}
        </g>

        {/* Open smile */}
        <path d="M86 98 H116 Q116 116 102 124 Q91 115 86 98 Z" fill="var(--ink)" stroke="var(--ink)" strokeWidth="4" />
      </g>
    </svg>
  );
}
