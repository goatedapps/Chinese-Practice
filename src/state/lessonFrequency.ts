// Tracks which recent days each lesson was completed on, so the app can nudge
// a student away from re-grinding one easy lesson -- see Practice.tsx and
// LessonSelect.tsx's use of shouldNudgeForLesson().
import { loadJSON } from "../lib/storage";
import { saveAndSync } from "../lib/sync";
import { dateKey } from "../lib/stats";
import { getCurrentLevel } from "../data/levels";

// Exported so state/SyncBootstrap.tsx can include this store in the set of
// keys it reconciles against Supabase after sign-in -- see lib/sync.ts.
export const LESSON_FREQUENCY_KEY = "hanyuPracticeLessonFrequency_v1";

// Nudge once a lesson has been completed on more than this many distinct days
// *within OVERPRACTICE_WINDOW_DAYS*. The window is the whole point: counting
// distinct days for all time meant a lesson practised six times across a
// school year stayed permanently flagged, so a single touch months later
// re-armed the nudge.
export const OVERPRACTICE_DAY_THRESHOLD = 5;
export const OVERPRACTICE_WINDOW_DAYS = 14;

// Vocabulary practice (Practice.tsx) and dictation (Tingxie) count separately:
// they're different work on the same lesson, and sharing one counter meant
// finishing a dictation made the vocabulary quiz claim to be over-practised.
// Tingxie's word-cloud arcade round deliberately records nothing at all -- it's
// a game, with its own daily BP cap already limiting it.
export type LessonActivity = "practice" | "dictation";

// Scoped by level as well as activity, since lesson numbers collide across
// levels (P2 has 19 lessons, P5 has 17) and P2's lesson 4 has nothing to do
// with P5's -- see data/levels.ts.
function entryKey(activity: LessonActivity, lessonNum: number): string {
  return `${getCurrentLevel()}:${activity}:${lessonNum}`;
}

// Values are day-key arrays. The isArray filter drops entries written by the
// pre-scoping shape ({ days, lastAt } under a bare lesson number), which a
// device still running the old build can push back at any time -- and since
// recordLessonCompleted() saves this filtered map, the first write clears them
// for good. Losing that history is the point: it counted two levels' lessons
// and every activity type as one bucket.
function load(): Record<string, string[]> {
  const raw = loadJSON<Record<string, unknown>>(LESSON_FREQUENCY_KEY, {});
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) out[key] = value.filter((d): d is string => typeof d === "string");
  }
  return out;
}

// The OVERPRACTICE_WINDOW_DAYS day-keys ending today. Built by local-calendar
// arithmetic rather than ms offsets so a DST shift can't drop or duplicate a
// day, same reasoning as dateKey() itself.
function windowDayKeys(): Set<string> {
  const today = new Date();
  const keys = new Set<string>();
  for (let i = 0; i < OVERPRACTICE_WINDOW_DAYS; i++) {
    keys.add(dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).getTime()));
  }
  return keys;
}

export function recordLessonCompleted(activity: LessonActivity, lessonNum: number): void {
  const map = load();
  const key = entryKey(activity, lessonNum);
  const inWindow = windowDayKeys();
  // Pruned on write, so an entry stays bounded at OVERPRACTICE_WINDOW_DAYS
  // instead of growing for the life of the account.
  const days = (map[key] ?? []).filter((d) => inWindow.has(d));
  const today = dateKey(Date.now());
  if (!days.includes(today)) days.push(today);
  saveAndSync(LESSON_FREQUENCY_KEY, { ...map, [key]: days });
}

export function shouldNudgeForLesson(activity: LessonActivity, lessonNum: number): boolean {
  const days = load()[entryKey(activity, lessonNum)];
  if (!days) return false;
  const inWindow = windowDayKeys();
  // Filtered again on read, not just on write: a device that hasn't recorded
  // anything in weeks still holds that many stale day-keys on disk.
  return days.filter((d) => inWindow.has(d)).length > OVERPRACTICE_DAY_THRESHOLD;
}
