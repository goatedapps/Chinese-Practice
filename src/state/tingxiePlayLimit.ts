// Daily round counter backing Tingxie Play's (词云游戏) BP cap -- see
// TINGXIE_PLAY_CONFIG.DAILY_BP_ROUND_LIMIT in data/pet.ts. Same day-scoped-
// reset pattern as state/specialQuest.ts/state/todaySummary.ts (a stored
// entry whose dateKey isn't today is treated as "0 rounds played yet")
// and likewise local-only/not synced across devices -- this is a soft
// per-device anti-farming limit, not meaningful progress worth syncing.
import { dateKey } from "../lib/stats";
import { loadJSON, saveJSON } from "../lib/storage";

const TINGXIE_PLAY_LIMIT_KEY = "hanyuPracticeTingxiePlayLimit_v1";

interface StoredShape {
  dateKey: string;
  roundCount: number;
}

function loadStore(): StoredShape {
  const saved = loadJSON<StoredShape | null>(TINGXIE_PLAY_LIMIT_KEY, null);
  if (!saved || saved.dateKey !== dateKey(Date.now())) return { dateKey: dateKey(Date.now()), roundCount: 0 };
  return saved;
}

function saveStore(store: StoredShape): void {
  saveJSON(TINGXIE_PLAY_LIMIT_KEY, store);
}

// How many Play rounds have already been finished today -- Play.tsx checks
// this against TINGXIE_PLAY_CONFIG.DAILY_BP_ROUND_LIMIT once, when a round
// starts, to decide (for the whole round) whether it's still BP-eligible.
export function tingxiePlayRoundsToday(): number {
  return loadStore().roundCount;
}

// Records that a round was finished -- called once per genuine finish
// (timer reaching 0), regardless of that round's own score, so a 0-point
// round still counts toward the daily limit like any other.
export function recordTingxiePlayRound(): void {
  const store = loadStore();
  saveStore({ ...store, roundCount: store.roundCount + 1 });
}
