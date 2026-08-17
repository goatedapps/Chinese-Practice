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
  // Restricts this level's Practice picker (and, enforced regardless of UI
  // path, any session actually built -- see lib/typeSession.ts's
  // selectTypeSessionGroups()) to only these CATEGORIES keys. Omit for a
  // level whose full question bank is real, offerable content (e.g. p5).
  // P2's bank has real content for only these five categories today -- the
  // rest (phrase/conjunction/sentence/errorcorrect/dialogue/practical)
  // still exist on disk as tiny placeholder groups from the level's
  // original scaffolding (see CLAUDE.md's Levels note) and would otherwise
  // be selectable/leak into a P2 session.
  relevantCategories?: string[];
}

// Add a new level here once its public/content/<id>/ directory exists (see
// CLAUDE.md's Levels note) -- no other code change is needed, every loader
// derives its fetch URLs and cache keys from getCurrentLevel().
export const LEVELS: LevelInfo[] = [
  { id: "p2", label: "P2", relevantCategories: ["cloze", "comprehension", "pinyin", "vocab", "usage"] },
  { id: "p5", label: "P5" }
];

// null means "every CATEGORIES key is relevant" (a level with no
// relevantCategories restriction, or an unrecognized level id).
export function getRelevantCategories(levelId: string): string[] | null {
  return LEVELS.find((l) => l.id === levelId)?.relevantCategories ?? null;
}

export function isCategoryRelevantForLevel(category: string, levelId: string): boolean {
  const relevant = getRelevantCategories(levelId);
  return relevant === null || relevant.includes(category);
}

export const DEFAULT_LEVEL = "p5";

let currentLevel: string = DEFAULT_LEVEL;

export function getCurrentLevel(): string {
  return currentLevel;
}

export function setCurrentLevel(level: string): void {
  currentLevel = level;
}
