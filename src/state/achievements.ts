import type { Achievement, AchievementType, HistoryEntry } from "../data/types";
import { dateKey, areAllMissionsComplete } from "../lib/stats";
import { MISSION_COMPLETE_BONUS_BP } from "../data/pet";
import { loadJSON } from "../lib/storage";
import { makeId } from "../lib/id";

const ACHIEVEMENTS_KEY = "hanyuPracticeAchievements_v1";
const MAX_ACHIEVEMENTS = 30;

export function loadAchievements(): Achievement[] {
  return loadJSON<Achievement[]>(ACHIEVEMENTS_KEY, []);
}

// Wipes the achievement log -- paired with history.ts's clearAllHistory() by
// Home.tsx's "Clear All" button on the merged RecentAchievements feed, since
// that feed shows both sources merged into one list; clearing only history
// used to leave achievement rows (e.g. "今日任务全部完成 All missions
// complete today") still visible afterward, which looked like the button
// didn't work.
export function clearAllAchievements(): void {
  localStorage.removeItem(ACHIEVEMENTS_KEY);
}

// Dedup rules:
//  - "missionComplete" recurs once per calendar day.
//  - "questionsMilestone" can only genuinely be earned once ever
//    (questionsLifetime is monotonic), so dedup by the milestone number
//    forever, not just today.
export function logAchievement(entry: Omit<Achievement, "id" | "date"> & { date?: number }): void {
  const list = loadAchievements();
  const date = entry.date ?? Date.now();
  const isDuplicate = list.some((a) => {
    if (a.type !== entry.type) return false;
    if (entry.type === "missionComplete") return dateKey(a.date) === dateKey(date);
    if (entry.type === "questionsMilestone") return a.detail === entry.detail;
    return false;
  });
  if (isDuplicate) return;
  const next = [{ ...entry, id: makeId(), date }, ...list].slice(0, MAX_ACHIEVEMENTS);
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(next));
}

// Checked *before* calling logAchievement() to decide whether a one-time-
// per-day bonus (e.g. MISSION_COMPLETE_BONUS_BP) should fire -- logAchievement
// itself only dedupes the achievement *record*, it has no way to tell the
// caller whether the entry it just wrote was new or a no-op duplicate.
export function hasLoggedToday(type: AchievementType): boolean {
  const today = dateKey(Date.now());
  return loadAchievements().some((a) => a.type === type && dateKey(a.date) === today);
}

// Single entry point for the "all 3 Today's Missions done" check, called
// from both Result.tsx (after a quiz session) and Tingxie's Learn/Apply/
// Practice completion effects (after a dictation activity) -- either kind
// of session can be the one that tips all 3 missions over, so both need to
// run this same check. Logs the (day-deduped) achievement every time all 3
// are complete, but only awards the BP bonus the first time that day.
export function checkAndAwardMissionBonus(hist: HistoryEntry[], awardBP: (amount: number) => void): void {
  if (!areAllMissionsComplete(hist)) return;
  const alreadyLoggedToday = hasLoggedToday("missionComplete");
  logAchievement({ type: "missionComplete" });
  if (!alreadyLoggedToday) awardBP(MISSION_COMPLETE_BONUS_BP);
}
