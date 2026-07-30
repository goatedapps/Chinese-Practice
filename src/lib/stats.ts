import type { HistoryEntry } from "../data/types";

// Local-calendar-day key (not raw ms division, which breaks around DST) --
// used to bucket HistoryEntry.date (a local-clock Date.now() timestamp,
// see Result.tsx) into "today"/"yesterday"/etc.
function dateKey(ms: number): string {
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
