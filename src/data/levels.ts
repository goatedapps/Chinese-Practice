// Content loaders read this module's level; React reads AppState.level.
// Level changes must call setCurrentLevel() and dispatch SET_LEVEL together.
export interface LevelInfo {
  id: string;
  label: string;
  // Restricts both the picker and session selection to real categories.
  // Omit when all categories have real content.
  relevantCategories?: string[];
}

// Each registered level needs metadata and question, tingxie and story indexes.
export const LEVELS: LevelInfo[] = [
  { id: "p2", label: "P2", relevantCategories: ["cloze", "comprehension", "pinyin", "vocab", "usage"] },
  { id: "p3", label: "P3", relevantCategories: ["pinyin", "vocab", "phrase", "usage", "conjunction", "cloze", "errorcorrect", "comprehension", "dialogue", "practical"] },
  { id: "p5", label: "P5" },
  { id: "p6", label: "P6" }
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
