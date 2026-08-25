import { useRef } from "react";
import type { TouchEvent } from "react";

const SWIPE_THRESHOLD_PX = 50;
// Caps how far off-axis (vertical) a gesture can drift and still count as a
// horizontal swipe -- rejects diagonal drags so they don't fire a swipe
// action by accident.
const SWIPE_MAX_CROSS_PX = 60;
// How long guardClick() keeps blocking after a swipe fires, in case the
// touch's compatibility click event never arrives (it self-clears either
// way, so a stuck guard can't permanently block real taps).
const GUARD_MS = 400;

// Horizontal swipe-left/right detection for touch devices, meant to sit
// alongside a tap-to-toggle handler on the same element (e.g. TingxieFlipCard).
// A real swipe still ends in a touchend inside the element and browsers still
// synthesize a click for it, so callers must gate their tap action behind
// `guardClick()` -- it returns true (and consumes itself) exactly once right
// after a swipe, so that trailing click doesn't also toggle the card.
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const guardRef = useRef(false);
  const guardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: TouchEvent) {
    const start = startRef.current;
    startRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dy) > SWIPE_MAX_CROSS_PX) return;

    guardRef.current = true;
    if (guardTimeoutRef.current) clearTimeout(guardTimeoutRef.current);
    guardTimeoutRef.current = setTimeout(() => {
      guardRef.current = false;
    }, GUARD_MS);

    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  }

  function guardClick(): boolean {
    if (!guardRef.current) return false;
    guardRef.current = false;
    if (guardTimeoutRef.current) clearTimeout(guardTimeoutRef.current);
    return true;
  }

  return { onTouchStart, onTouchEnd, guardClick };
}
