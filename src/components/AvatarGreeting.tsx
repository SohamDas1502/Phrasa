"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { HelloBubble } from "./HelloBubble";

type Phase = "offstage" | "entering" | "arrived" | "resting";

/** How long the wave lasts before the arm is back down (matches .avatar-wave in globals.css). */
const WAVE_MS = 3050;

/** One walk cycle (left step + right step), in ms. */
const CYCLE = 380;
/** How far a planted foot sweeps back per step, in SVG units (the viewBox is 200 wide). */
const STRIDE = 52;
const HALF = STRIDE / 2;
/** One hop (crouch, flight, landing), in ms. */
const HOP = 560;
const TAKEOFF = 0.2;
const LAND = 0.8;
const ARC_SAMPLES = 12;

/** A keyframe at an absolute time in ms; `easing` applies until the next keyframe. */
type Key = [ms: number, transform: string, easing?: string];

function toKeyframes(keys: Key[], total: number): Keyframe[] {
  return keys.map(([ms, transform, easing]) => ({ offset: ms / total, transform, easing: easing ?? "linear" }));
}

/**
 * Builds the entrance: walk in from the right edge, then two hops into place.
 * Every limb is one continuous track, so walking flows straight into the jumps.
 */
function buildEntrance(distancePx: number, widthPx: number) {
  const unitPx = widthPx / 200;
  const strideStepPx = STRIDE * unitPx;

  // Save enough room for two decent hops, walk the rest in whole cycles.
  const targetHopPx = widthPx * 0.7;
  const cycles = Math.max(1, Math.round((distancePx - 2 * targetHopPx) / (2 * strideStepPx)));
  const walkPx = cycles * 2 * strideStepPx;
  const hopPx = Math.max((distancePx - walkPx) / 2, widthPx * 0.3);
  const startPx = walkPx + 2 * hopPx;
  const walkMs = cycles * CYCLE;
  const total = walkMs + 2 * HOP;
  const hopHeight = widthPx * 0.5;

  const x: Key[] = [[0, `translateX(${startPx}px)`], [walkMs, `translateX(${2 * hopPx}px)`]];
  const y: Key[] = [[0, "translateY(0)"]];
  const squash: Key[] = [[0, "scale(1, 1)"]];
  const body: Key[] = [];
  const footL: Key[] = [];
  const footR: Key[] = [];
  const armL: Key[] = [];
  const armR: Key[] = [];

  // Walk. A planted foot sweeps back at exactly the body's speed, so it stays put on the ground.
  for (let c = 0; c < cycles; c++) {
    const s = c * CYCLE;
    footL.push(
      [s, `translate(${-HALF}px, 0)`],
      [s + CYCLE * 0.5, `translate(${HALF}px, 0)`, "ease-in-out"],
      [s + CYCLE * 0.75, "translate(0px, -12px) rotate(-8deg)", "ease-in-out"],
    );
    footR.push(
      [s, `translate(${HALF}px, 0)`, "ease-in-out"],
      [s + CYCLE * 0.25, "translate(0px, -12px) rotate(-8deg)", "ease-in-out"],
      [s + CYCLE * 0.5, `translate(${-HALF}px, 0)`],
    );
    body.push(
      [s, "translateY(0) rotate(0deg)", "ease-out"],
      [s + CYCLE * 0.25, "translateY(-6px) rotate(-2deg)", "ease-in"],
      [s + CYCLE * 0.5, "translateY(0) rotate(0deg)", "ease-out"],
      [s + CYCLE * 0.75, "translateY(-6px) rotate(2deg)", "ease-in"],
    );
    armL.push([s, "rotate(-16deg)", "ease-in-out"], [s + CYCLE * 0.5, "rotate(16deg)", "ease-in-out"]);
    // The right arm is drawn raised; +140deg at the shoulder makes it hang.
    armR.push([s, "rotate(156deg)", "ease-in-out"], [s + CYCLE * 0.5, "rotate(124deg)", "ease-in-out"]);
  }
  footL.push([walkMs, `translate(${-HALF}px, 0)`, "ease-out"]);
  footR.push([walkMs, `translate(${HALF}px, 0)`, "ease-out"]);
  body.push([walkMs, "translateY(0) rotate(0deg)"]);
  armL.push([walkMs, "rotate(-16deg)", "ease-in-out"]);
  armR.push([walkMs, "rotate(156deg)", "ease-in-out"]);

  // Feet slide together during the first crouch, then stay tucked.
  footL.push([walkMs + HOP * TAKEOFF, "translate(0px, 0)"]);
  footR.push([walkMs + HOP * TAKEOFF, "translate(0px, 0)"]);

  // Two hops.
  for (let h = 0; h < 2; h++) {
    const s = walkMs + h * HOP;
    const fromX = (2 - h) * hopPx;
    const up = s + HOP * TAKEOFF;
    const down = s + HOP * LAND;

    x.push([up, `translateX(${fromX}px)`], [down, `translateX(${fromX - hopPx}px)`]);

    y.push([up, "translateY(0)"]);
    for (let i = 1; i < ARC_SAMPLES; i++) {
      const p = i / ARC_SAMPLES;
      y.push([up + (down - up) * p, `translateY(${-4 * hopHeight * p * (1 - p)}px)`]);
    }
    y.push([down, "translateY(0)"]);

    squash.push(
      [s, "scale(1, 1)", "ease-out"],
      [s + HOP * 0.15, "scale(1.1, 0.86)", "ease-out"],
      [up + HOP * 0.08, "scale(0.92, 1.1)", "ease-in-out"],
      [down - HOP * 0.04, "scale(0.97, 1.04)", "ease-out"],
      [down + HOP * 0.07, "scale(1.1, 0.88)", "ease-out"],
    );

    armL.push([up, "rotate(8deg)", "ease-out"], [s + HOP * 0.5, "rotate(48deg)", "ease-in"], [down, "rotate(8deg)", "ease-out"]);
    armR.push([up, "rotate(132deg)", "ease-out"], [s + HOP * 0.5, "rotate(92deg)", "ease-in"], [down, "rotate(132deg)", "ease-out"]);
  }

  x.push([total, "translateX(0)"]);
  y.push([total, "translateY(0)"]);
  squash.push([total, "scale(1, 1)"]);
  body.push([total, "translateY(0) rotate(0deg)"]);
  footL.push([total, "translate(0px, 0)"]);
  footR.push([total, "translate(0px, 0)"]);
  armL.push([total, "rotate(0deg)"]);
  armR.push([total, "rotate(140deg)"]);

  return {
    total,
    tracks: { x, y, squash, body, footL, footR, armL, armR },
  };
}

/** Avatar walks in from the right edge, hops twice into place, then waves and says hello. */
export function AvatarGreeting() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("offstage");

  useEffect(() => {
    const outer = rootRef.current;
    if (!outer) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setPhase("arrived"));
      return () => cancelAnimationFrame(id);
    }

    const lift = outer.firstElementChild as HTMLElement;
    const svg = lift.querySelector("svg")!;
    const part = (name: string) => outer.querySelector<SVGElement>(`[data-part="${name}"]`)!;

    const rect = outer.getBoundingClientRect();
    const { total, tracks } = buildEntrance(window.innerWidth - rect.left + 8, rect.width);
    const options: KeyframeAnimationOptions = { duration: total, fill: "backwards" };
    const play = (el: Element, keys: Key[]) => el.animate(toKeyframes(keys, total), options);

    const animations = [
      play(outer, tracks.x),
      play(lift, tracks.y),
      play(svg, tracks.squash),
      play(part("body"), tracks.body),
      play(part("foot-left"), tracks.footL),
      play(part("foot-right"), tracks.footR),
      play(part("arm-left"), tracks.armL),
      play(part("arm-right"), tracks.armR),
    ];
    // Start every track on the same frame so feet stay locked to the ground.
    const start = document.timeline.currentTime;
    for (const a of animations) a.startTime = start;

    let cancelled = false;
    const id = requestAnimationFrame(() => setPhase("entering"));

    animations[0].finished
      .then(() => {
        if (!cancelled) setPhase("arrived");
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      for (const a of animations) a.cancel();
    };
  }, []);

  // Once resting, blink at random moments: a quick snap shut, sometimes twice in a row.
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (phase !== "resting" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id: ReturnType<typeof setTimeout>;
    const after = (ms: number, fn: () => void) => (id = setTimeout(fn, ms));
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const blink = (thenDouble: boolean) => {
      setBlinking(true);
      after(rand(80, 140), () => {
        setBlinking(false);
        if (thenDouble) after(rand(110, 180), () => blink(false));
        else schedule();
      });
    };
    const schedule = () => after(rand(800, 4000), () => blink(Math.random() < 0.3));

    schedule();
    return () => clearTimeout(id);
  }, [phase]);

  // After waving, lower the arm and settle into the idle pose.
  useEffect(() => {
    if (phase !== "arrived") return;
    const id = setTimeout(() => setPhase("resting"), WAVE_MS);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <div className="relative w-27.5 shrink-0 pt-12 sm:w-45 sm:pt-14">
      {(phase === "arrived" || phase === "resting") && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <div className="bubble-pop">
            <HelloBubble />
          </div>
        </div>
      )}
      {/* Hidden until the entrance is set up, so it never flashes in its final spot first. */}
      <div ref={rootRef} className={phase === "offstage" ? "invisible" : undefined}>
        <div>
          <Avatar
            pose={phase === "resting" ? "idle" : phase === "arrived" ? "waving" : "entering"}
            blinking={blinking}
            className="avatar-squash h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
