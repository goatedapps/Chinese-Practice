import type { ShopItem } from "../../data/types";
import type { ToyGameConfig } from "../../data/pet";

// A game reports whether it was a "perfect" (bonus-earning) run and a short
// display string for the result screen (e.g. "5 / 5" for a round-based game,
// "0:38" for a timed one) -- PlayGame.tsx turns `perfect` into the actual
// mood reward via config.flatMood/bonusMood, it never inspects a game's raw
// score itself. This is what lets round-based games (CatchGame/FeatherGame)
// and time-based ones (MemoryGame) share one completion contract.
export interface GameCompletion {
  perfect: boolean;
  scoreLabel: string;
}

export interface GameProps {
  item: ShopItem;
  config: ToyGameConfig;
  onComplete: (result: GameCompletion) => void;
  onExit: () => void;
}
