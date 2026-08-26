// Tracks how many distinct days each lesson number has been completed on
// (Practice->Vocabulary or any Tingxie activity), so the app can nudge a
// student away from over-repeating one easy lesson -- see LessonSelect.tsx
// and Practice.tsx's use of shouldNudgeForLesson().
import { loadJSON } from "../lib/storage";
import { saveAndSync } from "../lib/sync";
import { dateKey } from "../lib/stats";

// Exported so state/SyncBootstrap.tsx can include this store in the set of
// keys it reconciles against Supabase after sign-in -- see lib/sync.ts.
export const LESSON_FREQUENCY_KEY = "hanyuPracticeLessonFrequency_v1";

export const OVERPRACTICE_DAY_THRESHOLD = 5;
export const OVERPRACTICE_RECENCY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface LessonFrequencyEntry {
  days: string[];
  lastAt: number;
}

type LessonFrequencyMap = Record<number, LessonFrequencyEntry>;

function load(): LessonFrequencyMap {
  return loadJSON<LessonFrequencyMap>(LESSON_FREQUENCY_KEY, {});
}

export function recordLessonCompleted(lessonNum: number): void {
  const map = load();
  const entry = map[lessonNum] ?? { days: [], lastAt: 0 };
  const today = dateKey(Date.now());
  const days = entry.days.includes(today) ? entry.days : [...entry.days, today];
  saveAndSync(LESSON_FREQUENCY_KEY, { ...map, [lessonNum]: { days, lastAt: Date.now() } });
}

export function shouldNudgeForLesson(lessonNum: number): boolean {
  const entry = load()[lessonNum];
  if (!entry) return false;
  return entry.days.length > OVERPRACTICE_DAY_THRESHOLD && Date.now() - entry.lastAt <= OVERPRACTICE_RECENCY_WINDOW_MS;
}
