import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { useAppState } from "../../state/AppStateContext";
import { loadOwlPosition, saveOwlPosition } from "../../state/owlPosition";

// quiz/result/auth: screens with their own focused flow (or no page chrome
// to perch in) -- keep the owl out of the way there, same reasoning as
// TopNav hiding on these (App.tsx). owl: the Pet screen already centers on
// the actual pet owl, so a second decorative one flying in and perching
// there would be redundant.
const HIDDEN_ON = new Set(["quiz", "result", "auth", "owl"]);

type Phase = "hidden" | "flying" | "landed";

interface Pos {
  left: number;
  top: number;
}

function clampPos(pos: Pos, width: number, height: number): Pos {
  const maxLeft = Math.max(0, window.innerWidth - width);
  const maxTop = Math.max(0, window.innerHeight - height);
  return { left: Math.min(Math.max(pos.left, 0), maxLeft), top: Math.min(Math.max(pos.top, 0), maxTop) };
}

// A decorative flying-owl.png sprite that flies in from off-screen left the
// moment the student leaves Home for anywhere else, then perches mid-right
// and idles there (bob + breathing shadow) for as long as they stay off
// Home -- resets to hidden the moment they return Home, so the next
// departure flies in fresh rather than just reappearing already landed.
// Mounted once in App.tsx (not per screen), same pattern as CursorGlow.
//
// The default perch can land on top of a button on some screens (no fixed
// viewport spot is clear on every layout -- see state/owlPosition.ts's
// comment). Rather than chase a "safe" spot, the landed owl is draggable:
// the student can pick it up and move it, and that spot is remembered for
// every future landing (state/owlPosition.ts), not just this visit.
export function OwlFlyover() {
  const state = useAppState();
  const prevScreenRef = useRef(state.screen);
  const [phase, setPhase] = useState<Phase>("hidden");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });

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

  // Picks the landing spot the instant the fly-in finishes: a previously
  // dragged spot (converted from the saved viewport fraction back to
  // pixels) if there is one, otherwise the pixel equivalent of the default
  // CSS perch. useLayoutEffect (not useEffect) so this is resolved before
  // the browser paints -- no visible flash of the default spot first.
  useLayoutEffect(() => {
    if (phase !== "landed") return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 104;
    const height = rect?.height ?? 84;
    const saved = loadOwlPosition();
    const target = saved
      ? { left: saved.xFrac * window.innerWidth, top: saved.yFrac * window.innerHeight }
      : { left: window.innerWidth - 28 - width, top: window.innerHeight / 2 - height / 2 };
    setPos(clampPos(target, width, height));
  }, [phase]);

  // Keeps a dragged/landed spot on-screen if the window is resized (e.g.
  // rotating a tablet) instead of letting it drift off the edge.
  useEffect(() => {
    if (phase !== "landed") return;
    function onResize() {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos((prev) => (prev ? clampPos(prev, rect.width, rect.height) : prev));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase]);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (phase !== "landed" || !pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOffsetRef.current = { dx: e.clientX - pos.left, dy: e.clientY - pos.top };
    setDragging(true);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 104;
    const height = rect?.height ?? 84;
    setPos(clampPos({ left: e.clientX - dragOffsetRef.current.dx, top: e.clientY - dragOffsetRef.current.dy }, width, height));
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    const rect = wrapperRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 104;
    const height = rect?.height ?? 84;
    const final = clampPos({ left: e.clientX - dragOffsetRef.current.dx, top: e.clientY - dragOffsetRef.current.dy }, width, height);
    setPos(final);
    saveOwlPosition({ xFrac: final.left / window.innerWidth, yFrac: final.top / window.innerHeight });
  }

  // A cancelled pointer (browser-interrupted gesture -- can happen on a real
  // touch device, not just this case) reports clientX/clientY as 0 per spec,
  // not a real position -- treating it like handlePointerUp would snap the
  // owl to the corner and persist that. Just abort the drag in place instead,
  // leaving pos wherever the last real pointermove left it.
  function handlePointerCancel(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  if (phase === "hidden" || HIDDEN_ON.has(state.screen)) return null;

  return (
    <div
      ref={wrapperRef}
      className={
        "owl-flyover" +
        (phase === "flying" ? " owl-flyover-flying" : " owl-flyover-landed") +
        (dragging ? " owl-flyover-dragging" : "")
      }
      style={phase === "landed" && pos ? { position: "fixed", left: pos.left, top: pos.top, right: "auto", transform: "none", pointerEvents: "auto" } : undefined}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="owl-flyover-shadow" />
      {/* draggable=false -- an <img> is natively draggable by default, which
          otherwise hijacks the gesture into the browser's own HTML5
          drag-and-drop (a translucent ghost follows the cursor while the
          real element never moves, and the native drag start fires a
          pointercancel that aborts our own drag logic mid-gesture). */}
      <img src="/owl/flying-owl.png" alt="" className="owl-flyover-sprite" draggable={false} />
    </div>
  );
}
