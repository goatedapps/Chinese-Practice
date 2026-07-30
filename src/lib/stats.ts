import type { HistoryEntry } from "../data/types";

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

// Consecutive local-calendar days (walking backward from today, or from
// yesterday if nothing's logged yet today -- Duolingo-style grace period)
// that have at least one history entry.
// Note: history.ts caps storage at the last 50 entries (not 50 days), so a
// student doing many sessions/day could in theory evict entries from days
// further back than the cap covers, undercounting a very long streak --
// negligible in practice, not worth solving here.
export function getStreak(hist: HistoryEntry[], now: Date = new Date()): number {
  const days = new Set(hist.map((h) => dateKey(h.date)));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dateKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dateKey(cursor.getTime()))) return 0;
  }
  let streak = 0;
  while (days.has(dateKey(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
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

export function areAllMissionsComplete(hist: HistoryEntry[]): boolean {
  return isLessonMissionComplete(hist) && getReadingMissionCount(hist) >= 1;
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
