// Tingxie's own session state is intentionally NOT persisted (see
// Tingxie.tsx) -- but Today's Mission needs to know, from Home, whether the
// student completed a dictation activity (Learn's vocab or sentence game,
// Apply, or Practice) *today*, after Tingxie has already unmounted. This one
// small marker is that bridge -- everything else about a Tingxie visit is
// still discarded when the student leaves.
//
// Deliberately has NO import of state/achievements.ts or state/history.ts
// here, even though callers always pair recordTingxieActivityCompleted()
// with a checkAndAwardMissionBonus() call right after -- lib/stats.ts
// already imports this file (for isTingxieMissionComplete), and
// achievements.ts imports lib/stats.ts, so importing achievements.ts from
// here would create a 3-file import cycle. Callers (Learn/Apply/Practice)
// call both functions directly instead.
import { loadJSON } from "../lib/storage";
import { saveAndSync } from "../lib/sync";

// Exported so state/SyncBootstrap.tsx can include this store in the set of
// keys it reconciles against Supabase after sign-in -- see lib/sync.ts.
export const TINGXIE_PROGRESS_KEY = "hanyuPracticeTingxieProgress_v1";

export function recordTingxieActivityCompleted(): void {
  saveAndSync(TINGXIE_PROGRESS_KEY, { lastCompletedAt: Date.now() });
}

export function getTingxieLastCompletedAt(): number | null {
  const saved = loadJSON<{ lastCompletedAt?: number } | null>(TINGXIE_PROGRESS_KEY, null);
  return typeof saved?.lastCompletedAt === "number" ? saved.lastCompletedAt : null;
}
