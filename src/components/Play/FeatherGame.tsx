import { useRef, useState } from "react";
import type { GameProps } from "./types";
import { Sound } from "../../lib/sound";

function randomFeatherX(): number {
  return 12 + Math.random() * 76; // percentage, keep away from the very edges
}

// 🪁 Kite's minigame: one feather at a time falls from a random x position
// (a CSS keyframe animation, same "remount via key to restart" pattern as
// CatchGame's marker sweep -- see that file's comment for why this beats a
// requestAnimationFrame + state loop). Unlike the ball game, the feather
// itself is the tap target (no separate "Catch!" button) -- tapping it
// before it lands is always a hit; letting the fall animation finish
// untapped (onAnimationEnd) is an automatic miss. `resolve()` is shared by
// both paths and guarded by lockedRef so a tap and a same-instant natural
// animation-end can't both resolve the round.
export function FeatherGame({ item, config, onComplete, onExit }: GameProps) {
  const attempts = config.attempts!;
  const bonusThreshold = config.bonusThreshold!;

  const [attempt, setAttempt] = useState(0);
  const [hits, setHits] = useState(0);
  const [featherX, setFeatherX] = useState(randomFeatherX);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);

  const featherRef = useRef<HTMLButtonElement>(null);
  const lockedRef = useRef(false);

  const fallDuration = Math.max(1.0, 2.0 - attempt * 0.12); // seconds to fall, ramps up each round

  function resolve(isHit: boolean) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    if (featherRef.current) featherRef.current.style.animationPlayState = "paused";

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
      setFeatherX(randomFeatherX());
      setFeedback(null);
      lockedRef.current = false;
    }, 600);
  }

  return (
    <div className="screen play-screen feather-game">
      <button className="back-btn" onClick={onExit}>
        ← 返回
      </button>
      <h1>{item.label}</h1>
      <p className="picker-hint">
        <span className="en">Tap the feather before it touches the ground.</span>
      </p>
      <div className="play-round-progress">{`第 ${attempt + 1} / ${attempts} 次`}</div>
      <div className="feather-sky">
        <button
          key={attempt}
          ref={featherRef}
          className="feather-target"
          style={{ left: `${featherX}%`, animationDuration: `${fallDuration}s` }}
          onClick={() => resolve(true)}
          onAnimationEnd={() => resolve(false)}
          disabled={feedback !== null}
          aria-label="接住羽毛 Catch the feather"
        >
          🪶
        </button>
        <div className="feather-ground" />
      </div>
      <div className="play-round-feedback-slot">
        {feedback && (
          <div className={`play-round-feedback play-round-feedback-${feedback}`}>
            {feedback === "hit" ? "✓ 接住了！Caught it!" : "✗ 掉地上了！It fell!"}
          </div>
        )}
      </div>
      <div className="play-round-hits">{`✓ 命中 Hits: ${hits} / ${attempts}`}</div>
    </div>
  );
}
