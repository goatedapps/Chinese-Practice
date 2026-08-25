import { useRef, useState } from "react";
import type { GameProps } from "./types";
import { Sound } from "../../lib/sound";

const ZONE_HALF_WIDTH = 9; // percentage points either side of the zone center

function randomZoneCenter(): number {
  return 18 + Math.random() * 64; // keep the zone away from the very edges of the track
}

// ⚽ Play Ball's minigame: the marker sweeps back and forth across the track
// via a plain CSS keyframe animation (`.catch-marker`/`catch-sweep` in
// styles.css), restarted each round by remounting it with `key={attempt}` --
// deliberately not a requestAnimationFrame + React state loop, which needs
// a state update every frame just to move a div and is an easy place for a
// silent stall (e.g. a StrictMode double-effect edge case) to leave the
// marker looking frozen. Hit detection reads the marker's *actual* on-screen
// position at tap time (getBoundingClientRect()), so it can never drift out
// of sync with what the student sees, no matter how the animation is
// implemented. `config.attempts` rounds, one point per round the tap landed
// inside the highlighted zone; `config.attempts`/`bonusThreshold` are always
// present for a "catch"-game config (see ToyGameConfig in data/pet.ts).
export function CatchGame({ item, config, onComplete, onExit }: GameProps) {
  const attempts = config.attempts!;
  const bonusThreshold = config.bonusThreshold!;

  const [attempt, setAttempt] = useState(0);
  const [hits, setHits] = useState(0);
  const [zoneCenter, setZoneCenter] = useState(randomZoneCenter);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const lockedRef = useRef(false);

  const sweepDuration = Math.max(1.15, 1.7 - attempt * 0.08); // seconds per full sweep, ramps up each round (gently -- a steeper/lower floor made late rounds too fast to react to)

  function handleTap() {
    if (lockedRef.current || !trackRef.current || !markerRef.current) return;
    lockedRef.current = true;

    const trackRect = trackRef.current.getBoundingClientRect();
    const markerRect = markerRef.current.getBoundingClientRect();
    const markerCenterX = markerRect.left + markerRect.width / 2;
    const positionPct = ((markerCenterX - trackRect.left) / trackRect.width) * 100;
    markerRef.current.style.animationPlayState = "paused";

    const isHit = Math.abs(positionPct - zoneCenter) <= ZONE_HALF_WIDTH;
    setFeedback(isHit ? "hit" : "miss");
    if (isHit) Sound.ding();
    else Sound.miss();
    const nextHits = hits + (isHit ? 1 : 0);
    setHits(nextHits);

    setTimeout(() => {
      const nextAttempt = attempt + 1;
      if (nextAttempt >= attempts) {
        onComplete({ perfect: nextHits >= bonusThreshold, scoreLabel: `${nextHits} / ${attempts}` });
        return;
      }
      setAttempt(nextAttempt);
      setZoneCenter(randomZoneCenter());
      setFeedback(null);
      lockedRef.current = false;
    }, 700);
  }

  return (
    <div className="screen play-screen catch-game">
      <button className="back-btn" onClick={onExit}>
        ← 返回 Back
      </button>
      <h1>{item.label}</h1>
      <p className="picker-hint">
        <span className="en">Tap "Catch!" when the ball crosses the highlighted zone.</span>
      </p>
      <div className="play-round-progress">{`第 ${attempt + 1} / ${attempts} 次`}</div>
      <div className="catch-track" ref={trackRef}>
        <div
          className="catch-zone"
          style={{ left: `${zoneCenter - ZONE_HALF_WIDTH}%`, width: `${ZONE_HALF_WIDTH * 2}%` }}
        />
        <div
          key={attempt}
          ref={markerRef}
          className="catch-marker"
          style={{ animationDuration: `${sweepDuration}s` }}
        >
          ⚽
        </div>
      </div>
      <div className="play-round-feedback-slot">
        {feedback && (
          <div className={`play-round-feedback play-round-feedback-${feedback}`}>
            {feedback === "hit" ? "✓ 接住了！Caught it!" : "✗ 差一点！So close!"}
          </div>
        )}
      </div>
      <button className="primary-btn catch-tap-btn" disabled={feedback !== null} onClick={handleTap}>
        🎾 接住！Catch!
      </button>
      <div className="play-round-hits">{`✓ 命中 Hits: ${hits} / ${attempts}`}</div>
    </div>
  );
}
