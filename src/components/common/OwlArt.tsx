import { forwardRef, useEffect, useRef } from "react";
import { owlSpritePath, hasOwlAnimation, owlAnimatedSpritePath } from "../../data/pet";
import type { MoodBucket } from "../../data/types";

interface OwlArtProps {
  stageKey: string;
  mood: MoodBucket;
  label: string;
  sizeClass: "owl-thumb" | "owl-hero" | "owl-large";
  // Unmute this variant's embedded audio track when it plays. Set on the
  // Home hero card, the Owl detail screen, and the Bag/"Feed" screen --
  // i.e. everywhere the pet is a primary focus of the screen, not just
  // incidentally rendered.
  playSound?: boolean;
}

// Forwards a ref to the root element so screens that need its on-screen
// position (the Bag's throw-to-owl animation) can target it directly.
export const OwlArt = forwardRef<HTMLDivElement, OwlArtProps>(function OwlArt(
  { stageKey, mood, label, sizeClass, playSound = false },
  ref
) {
  const animated = hasOwlAnimation(stageKey, mood);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!animated) return;
    const video = videoRef.current;
    if (!video) return;
    // Set imperatively rather than relying solely on the JSX `muted` prop --
    // browsers read the live IDL property, and setting it just before play()
    // avoids a timing gotcha where the attribute alone doesn't stick.
    video.muted = !playSound;
    video.currentTime = 0;
    video.play().catch(() => {
      // Autoplay -- especially unmuted (playSound) -- can be blocked before
      // the student has interacted with the page at all; the video still
      // renders its first frame, so it's harmless to skip playback here.
    });
  }, [stageKey, mood, playSound, animated]);

  return (
    <div ref={ref} className={`owl-art owl-stage-${stageKey} ${sizeClass}`}>
      {animated ? (
        // No `controls` -- this is a one-shot sprite animation, not a video
        // the student plays/pauses. No `loop`: it plays through once and
        // stops on its last frame. playsInline stops iOS from taking it
        // fullscreen. Audio is muxed into the file itself (no separate
        // sound asset) -- muted is set imperatively above.
        <video ref={videoRef} src={owlAnimatedSpritePath(stageKey, mood)} playsInline aria-label={label} />
      ) : (
        <img src={owlSpritePath(stageKey, mood)} alt={label} />
      )}
    </div>
  );
});
