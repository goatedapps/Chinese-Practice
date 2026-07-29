import { forwardRef, useEffect } from "react";
import { owlSpritePath, hasOwlAnimation, owlAnimatedSpritePath, owlAnimatedSoundPath } from "../../data/pet";
import type { MoodBucket } from "../../data/types";

interface OwlArtProps {
  stageKey: string;
  mood: MoodBucket;
  label: string;
  sizeClass: "owl-thumb" | "owl-large";
  // Play the variant's accompanying sound once when this stage/mood combo
  // is first shown here. Only set on the one screen the student deliberately
  // visits to check on their pet -- not on the Home thumbnail, which would
  // otherwise replay it on every trip back to the home screen.
  playSound?: boolean;
}

// Forwards a ref to the root element so screens that need its on-screen
// position (the Bag's throw-to-owl animation) can target it directly.
export const OwlArt = forwardRef<HTMLDivElement, OwlArtProps>(function OwlArt(
  { stageKey, mood, label, sizeClass, playSound = false },
  ref
) {
  const animated = hasOwlAnimation(stageKey, mood);

  useEffect(() => {
    if (!playSound || !animated) return;
    const audio = new Audio(owlAnimatedSoundPath(stageKey, mood));
    audio.play().catch(() => {
      // Autoplay can be blocked before the student has interacted with the
      // page at all -- harmless to skip in that case.
    });
    return () => audio.pause();
  }, [stageKey, mood, playSound, animated]);

  return (
    <div ref={ref} className={`owl-art owl-stage-${stageKey} ${sizeClass}`}>
      {animated ? (
        // No `controls` -- this is a looping sprite animation, not a video
        // the student plays/pauses. muted is required for autoplay to work
        // reliably across browsers; playsInline stops iOS from taking it
        // fullscreen. The accompanying sound (if any) is the separate
        // .mp3 played above, not audio muxed into this file.
        <video src={owlAnimatedSpritePath(stageKey, mood)} autoPlay loop muted playsInline aria-label={label} />
      ) : (
        <img src={owlSpritePath(stageKey, mood)} alt={label} />
      )}
    </div>
  );
});
