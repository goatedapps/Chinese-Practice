// Registry of available content levels (public/content/<level>/...) plus the
// one piece of mutable module state every content loader (questions.ts,
// tingxie.ts, stories.ts) reads to know which level's files to fetch. Kept
// as a plain module variable rather than threaded through every fetch
// function's signature -- AppStateContext's `level` field is the source of
// truth for React rendering/reducer logic, and the level switcher (see
// components/common/LevelBar.tsx) calls setCurrentLevel() in lockstep with
// dispatching SET_LEVEL so the two never drift apart.
export interface LevelInfo {
  id: string;
  label: string;
}

// Add a new level here once its public/content/<id>/ directory exists (see
// CLAUDE.md's Levels note) -- no other code change is needed, every loader
// derives its fetch URLs and cache keys from getCurrentLevel().
export const LEVELS: LevelInfo[] = [
  { id: "p2", label: "P2" },
  { id: "p5", label: "P5" }
];

export const DEFAULT_LEVEL = "p5";

let currentLevel: string = DEFAULT_LEVEL;

export function getCurrentLevel(): string {
  return currentLevel;
}

export function setCurrentLevel(level: string): void {
  currentLevel = level;
}
