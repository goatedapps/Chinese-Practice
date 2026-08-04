import type { HistoryEntry } from "../data/types";
import { getTingxieLastCompletedAt } from "../state/tingxieProgress";

// Local-calendar-day key (not raw ms division, which breaks around DST) --
// used to bucket HistoryEntry.date (a local-clock Date.now() timestamp,
// see Result.tsx) into "today"/"yesterday"/etc.
export function dateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function getTodayStats(hist: HistoryEntry[]): { questions: number; accuracy: number } {
  const today = dateKey(Date.now());
  const todays = hist.filter((h) => dateKey(h.date) === today);
  const questions = todays.reduce((sum, h) => sum + h.totalItems, 0);
  const correct = todays.reduce((sum, h) => sum + h.correctItems, 0);
  const accuracy = questions > 0 ? Math.round((correct / questions) * 100) : 0;
  return { questions, accuracy };
}

// The 4 categories that count toward the Reading Practice mission --
// deliberately excludes "errorcorrect". Exported so TodayMission.tsx can
// reuse the exact same list when randomly picking 2 for a quick-start quiz.
export const READING_MISSION_CATEGORIES = ["cloze", "comprehension", "dialogue", "practical"];

export function isLessonMissionComplete(hist: HistoryEntry[]): boolean {
  const today = dateKey(Date.now());
  return hist.some((h) => dateKey(h.date) === today && h.mode === "lesson");
}

export function getReadingMissionCount(hist: HistoryEntry[]): number {
  const today = dateKey(Date.now());
  let count = 0;
  for (const h of hist) {
    if (dateKey(h.date) !== today) continue;
    const counts = h.categoryCounts ?? {};
    for (const cat of READING_MISSION_CATEGORIES) count += counts[cat] ?? 0;
  }
  return count;
}

export function isTingxieMissionComplete(): boolean {
  const last = getTingxieLastCompletedAt();
  return last !== null && dateKey(last) === dateKey(Date.now());
}

export function areAllMissionsComplete(hist: HistoryEntry[]): boolean {
  return isLessonMissionComplete(hist) && getReadingMissionCount(hist) >= 1 && isTingxieMissionComplete();
}

// Short bilingual "time ago" for the achievements feed (e.g. "2小时前 2h ago").
export function formatRelativeTime(ms: number): string {
  const diffMin = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (diffMin < 1) return "刚刚 just now";
  if (diffMin < 60) return `${diffMin}分钟前 ${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}小时前 ${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}天前 ${diffDay}d ago`;
}
