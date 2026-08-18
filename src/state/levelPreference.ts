// Persists the student's chosen content level (see data/levels.ts) locally
// and syncs it via the same saveAndSync/pullAndMergeAll mechanism as the
// pet/history/achievements/Tingxie-progress stores (see lib/sync.ts) -- so a
// signed-in student's level choice follows them across devices, and a reload
// on any one device keeps whatever level they were last on instead of always
// snapping back to DEFAULT_LEVEL. Kept as its own tiny module (not folded
// into data/levels.ts) since it needs loadJSON/saveAndSync, and
// data/levels.ts is deliberately a plain, dependency-light module read by
// every content loader (questions.ts/tingxie.ts/stories.ts).
import { loadJSON } from "../lib/storage";
import { saveAndSync } from "../lib/sync";
import { DEFAULT_LEVEL, LEVELS } from "../data/levels";

export const LEVEL_KEY = "hanyuPracticeLevel_v1";

// Guards against a stale/removed level id (a level dropped from LEVELS since
// it was saved, or a malformed Supabase row) ever getting set as the active
// level.
export function isKnownLevel(id: unknown): id is string {
  return typeof id === "string" && LEVELS.some((l) => l.id === id);
}

// Read once at boot (AppStateContext's initialState) -- falls back to
// DEFAULT_LEVEL for a brand-new device/browser.
export function loadSavedLevel(): string {
  const saved = loadJSON<string | null>(LEVEL_KEY, null);
  return isKnownLevel(saved) ? saved : DEFAULT_LEVEL;
}

// Called alongside every setCurrentLevel()/SET_LEVEL dispatch pair (see
// components/common/LevelBar.tsx) so a level switch is persisted/synced the
// same instant it takes effect.
export function saveLevel(levelId: string): void {
  saveAndSync(LEVEL_KEY, levelId);
}
