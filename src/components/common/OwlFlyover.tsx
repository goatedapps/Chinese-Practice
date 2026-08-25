import { useEffect, useRef, useState } from "react";
import { useAppState } from "../../state/AppStateContext";

// quiz/result/auth: screens with their own focused flow (or no page chrome
// to perch in) -- keep the owl out of the way there, same reasoning as
// TopNav hiding on these (App.tsx). owl: the Pet screen already centers on
// the actual pet owl, so a second decorative one flying in and perching
// there would be redundant.
const HIDDEN_ON = new Set(["quiz", "result", "auth", "owl"]);

type Phase = "hidden" | "flying" | "landed";

// A decorative flying-owl.png sprite that flies in from off-screen left the
// moment the student leaves Home for anywhere else, then perches mid-right
// and idles there (bob + breathing shadow) for as long as they stay off
// Home -- resets to hidden the moment they return Home, so the next
// departure flies in fresh rather than just reappearing already landed.
// Mounted once in App.tsx (not per screen), same pattern as CursorGlow.
export function OwlFlyover() {
  const state = useAppState();
  const prevScreenRef = useRef(state.screen);
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    const prev = prevScreenRef.current;
    prevScreenRef.current = state.screen;
    if (prev === state.screen) return;

    if (state.screen === "home") {
      setPhase("hidden");
      return;
    }
    if (prev === "home") {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Reduced motion skips straight to landed -- no flight to play.
      setPhase(reduceMotion ? "landed" : "flying");
    }
    // Navigating between two non-home screens while already landed (or
    // hidden on a HIDDEN_ON screen) is left alone -- no re-trigger.
  }, [state.screen]);

  useEffect(() => {
    if (phase !== "flying") return;
    // Matches .owl-flyover-flying's animation-duration in CSS.
    const timer = setTimeout(() => setPhase("landed"), 2800);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "hidden" || HIDDEN_ON.has(state.screen)) return null;

  return (
    <div className={"owl-flyover" + (phase === "flying" ? " owl-flyover-flying" : " owl-flyover-landed")} aria-hidden="true">
      <div className="owl-flyover-shadow" />
      <img src="/owl/flying-owl.png" alt="" className="owl-flyover-sprite" />
    </div>
  );
}
