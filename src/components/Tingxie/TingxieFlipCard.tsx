import type { KeyboardEvent, ReactNode } from "react";

// Shared 3D flip-card shell for Tingxie's three flashcard screens (Learn's
// vocab tab, Apply, Practice) -- pure CSS perspective/backface-visibility/
// rotateY, ported directly from the source app (the technique has no
// Tailwind dependency, only the utility classes needed re-theming).
//
// The back face renders real <button>s (TTS, self-grade), so the outer
// clickable region can't be a <button> itself -- nested buttons are invalid
// HTML, same constraint PetHeroCard used to have. It's a <div
// role="button"> instead; App.tsx's global click-sound listener is
// extended to match `.tingxie-flip-card` alongside `button`/`.option-label`
// so it still gets the app-wide click sound.
export function TingxieFlipCard({ flipped, onToggle, front, back }: { flipped: boolean; onToggle: () => void; front: ReactNode; back: ReactNode }) {
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  }

  return (
    <div className="tingxie-flip-outer">
      <div className="tingxie-flip-card" role="button" tabIndex={0} onClick={onToggle} onKeyDown={handleKeyDown} aria-label="翻转卡片 Flip card">
        <div className={"tingxie-flip-inner" + (flipped ? " flipped" : "")}>
          <div className="tingxie-flip-face tingxie-flip-front">{front}</div>
          <div className="tingxie-flip-face tingxie-flip-back">{back}</div>
        </div>
      </div>
    </div>
  );
}
