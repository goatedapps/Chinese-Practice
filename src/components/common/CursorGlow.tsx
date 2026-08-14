import { useEffect, useRef } from "react";

// A soft purple circle that follows the cursor and radiates outward while
// hovering any interactive element -- mounted once in App.tsx (not per
// screen), so it works app-wide, not just on Home. "Interactive element"
// reuses the same selector App.tsx's own global click-sound listener
// already matches (button, .option-label, .tingxie-flip-card) -- those are
// the only three tap targets in the app that aren't a real <button>. A
// single position:fixed element positioned via CSS custom properties
// (rather than an ::after pseudo-element on each button) so it's never
// subject to any one element's own overflow/stacking-context quirks, and
// can be as big/bold as it needs to be regardless of which element it's
// hovering. Rendered as a direct child of App()'s provider tree (see
// App.tsx), not nested inside any screen's own DOM -- position:fixed is
// relative to the nearest ancestor with a transform/filter/perspective, and
// at least one screen (Home's 3D-tilted mission cards) sets exactly those,
// so nesting this inside a screen could break "follows the cursor across
// the whole viewport" the moment that screen is showing.
const INTERACTIVE_SELECTOR = "button, .option-label, .tingxie-flip-card";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    // Both a real mouse (not a touchscreen with no hover state -- a stray
    // glow stuck at the last tap position would look broken) and a visitor
    // who hasn't asked for less motion.
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let active = false;
    function handleMove(e: MouseEvent) {
      glow!.style.setProperty("--cx", `${e.clientX}px`);
      glow!.style.setProperty("--cy", `${e.clientY}px`);
      const target = e.target;
      const isInteractive = target instanceof Element && !!target.closest(INTERACTIVE_SELECTOR);
      if (isInteractive !== active) {
        active = isInteractive;
        glow!.classList.toggle("cursor-glow-active", isInteractive);
      }
    }
    function handleWindowLeave() {
      active = false;
      glow!.classList.remove("cursor-glow-active");
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleWindowLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleWindowLeave);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
