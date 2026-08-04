import type { GameProps } from "./types";

// Fallback for any toy whose TOY_GAMES `game` id has no matching component
// in PlayGame.tsx's switch yet (every current toy -- ball/kite/puzzle -- now
// has a real game; this exists for a future toy added before its game is
// built). The toy was already consumed from the Bag before this screen was
// reached, so this claims the flat completion reward (never perfect) rather
// than leaving the student's purchase wasted while the real game doesn't
// exist yet.
export function PlaceholderGame({ item, onComplete, onExit }: GameProps) {
  return (
    <div className="screen play-screen play-placeholder">
      <button className="back-btn" onClick={onExit}>
        ← 返回 Back
      </button>
      <h1>{item.label}</h1>
      <div className="play-placeholder-emoji">🚧</div>
      <p className="picker-hint">
        敬请期待，这个游戏还在制作中！
        <br />
        <span className="en">This game is still being built. Here's a little treat for now.</span>
      </p>
      <button className="primary-btn" onClick={() => onComplete({ perfect: false, scoreLabel: "—" })}>
        🎁 领取 Claim Reward
      </button>
    </div>
  );
}
