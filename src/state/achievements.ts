import type { Achievement } from "../data/types";
import { dateKey } from "../lib/stats";

const ACHIEVEMENTS_KEY = "hanyuPracticeAchievements_v1";
const MAX_ACHIEVEMENTS = 30;

function makeAchievementId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadAchievements(): Achievement[] {
  try {
    return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || "null") ?? [];
  } catch {
    return [];
  }
}

// Dedup rules (see the "fed" branch is deliberately never deduped -- every
// genuine feed logs its own entry):
//  - "missionComplete" recurs once per calendar day.
//  - "questionsMilestone"/"evolved" can each only genuinely be earned once
//    ever (questionsLifetime/growth are both monotonic), so dedup by the
//    milestone number / stage key forever, not just today.
export function logAchievement(entry: Omit<Achievement, "id" | "date"> & { date?: number }): void {
  const list = loadAchievements();
  const date = entry.date ?? Date.now();
  const isDuplicate = list.some((a) => {
    if (a.type !== entry.type) return false;
    if (entry.type === "missionComplete") return dateKey(a.date) === dateKey(date);
    if (entry.type === "questionsMilestone" || entry.type === "evolved") return a.detail === entry.detail;
    return false;
  });
  if (isDuplicate) return;
  const next = [{ ...entry, id: makeAchievementId(), date }, ...list].slice(0, MAX_ACHIEVEMENTS);
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(next));
}
