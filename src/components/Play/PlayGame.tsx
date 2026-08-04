import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { SHOP_ITEMS, TOY_GAMES } from "../../data/pet";
import { Sound } from "../../lib/sound";
import type { GameCompletion } from "./types";
import { CatchGame } from "./CatchGame";
import { FeatherGame } from "./FeatherGame";
import { MemoryGame } from "./MemoryGame";
import { PlaceholderGame } from "./PlaceholderGame";

interface PlayResult extends GameCompletion {
  moodReward: number;
  agedUp: boolean;
  age: number;
}

// Entry point for a toy's minigame (see Bag.tsx's "Play" button). The toy
// was already removed from the Bag the moment this screen was reached (see
// PetContext.tsx's consumeItem, called from Bag.tsx before dispatching
// START_PLAY) -- this screen only decides the *reward*, which is why
// leaving early (the back button, during a game) simply navigates back to
// "bag" with no reward applied, no separate "abandon" bookkeeping needed.
export function PlayGame() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { applyPlayReward } = usePet();
  const [result, setResult] = useState<PlayResult | null>(null);

  const item = SHOP_ITEMS.find((i) => i.id === state.playingItemId);
  const config = item ? TOY_GAMES[item.id] : null;

  function goToBag() {
    dispatch({ type: "GO_TO_SCREEN", screen: "bag" });
  }

  if (!item || !config) {
    return (
      <div className="screen play-screen">
        <button className="back-btn" onClick={goToBag}>
          ← 返回 Back
        </button>
        <p>找不到这个玩具。Toy not found.</p>
      </div>
    );
  }

  function handleComplete(completion: GameCompletion) {
    const moodReward = config!.flatMood + (completion.perfect ? config!.bonusMood : 0);
    const { agedUp, age } = applyPlayReward(item!, moodReward);
    if (completion.perfect) Sound.applause();
    else Sound.encourage();
    setResult({ ...completion, moodReward, agedUp, age });
  }

  if (result) {
    return (
      <div className="screen play-screen play-result">
        <h1>{item.label}</h1>
        <div className="play-result-card">
          <div className="play-result-emoji">{result.perfect ? "🌟" : "🙂"}</div>
          <p className="play-result-score">{`本次成绩 Score: ${result.scoreLabel}`}</p>
          {result.perfect && <p className="play-result-bonus">🎉 {config.bonusLabel}</p>}
          <p className="play-result-mood">{`🍚 饱食度 +${result.moodReward}`}</p>
          {result.agedUp && (
            <p className="play-result-agedup">
              🎉 长大了一岁，现在是 {result.age} 岁了！
              <br />
              Grew a year older — now {result.age} years old!
            </p>
          )}
        </div>
        <button className="primary-btn" onClick={goToBag}>
          🎁 完成 Done
        </button>
      </div>
    );
  }

  switch (config.game) {
    case "catch":
      return <CatchGame item={item} config={config} onComplete={handleComplete} onExit={goToBag} />;
    case "feather":
      return <FeatherGame item={item} config={config} onComplete={handleComplete} onExit={goToBag} />;
    case "memory":
      return <MemoryGame item={item} config={config} onComplete={handleComplete} onExit={goToBag} />;
    default:
      return <PlaceholderGame item={item} config={config} onComplete={handleComplete} onExit={goToBag} />;
  }
}
