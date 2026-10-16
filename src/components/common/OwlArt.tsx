import { forwardRef, useEffect, useRef, useState } from "react";
import { owlSpritePath, owlAnimatedSpritePath } from "../../data/pet";
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
  const videoSrc = owlAnimatedSpritePath(stageKey, mood);
  const posterSrc = owlSpritePath(stageKey, mood);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setVideoFailed(false);
  }, [stageKey, mood]);

  useEffect(() => {
    if (!videoSrc || videoFailed) return;
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
  }, [stageKey, mood, playSound, videoFailed, videoSrc]);

  return (
    <div ref={ref} className={`owl-art owl-stage-${stageKey} ${sizeClass}`}>
      {videoSrc && !videoFailed ? (
        // A fresh element isolates playback state between pet variants.
        <video
          key={`${stageKey}-${mood}`}
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          preload="metadata"
          playsInline
          aria-label={label}
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <img src={posterSrc} alt={label} decoding="async" />
      )}
    </div>
  );
});
