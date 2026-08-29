// Pins Today's Mission's "阅读理解 Reading Comprehension" row to the exact
// same question set for the whole calendar day, so leaving the quiz
// mid-session (via TopNav's leave-guard, the browser back button, etc.) and
// clicking "去完成" again hands back the same session instead of a fresh
// random category pick + a newly round-robin-drawn passage (selectTypeSessionGroups()
// advances its own per-category queue on every call). Deliberately keyed by
// calendar day, not "last unfinished attempt" (see state/pendingPractice.ts
// for that shape, used by Practice.tsx's own manual picker) -- once the day
// rolls over, a stale entry just no longer matches and a fresh one is
// generated and stored in its place, no explicit cleanup needed.
import type { QuestionGroup } from "../data/types";
import { dateKey } from "../lib/stats";

const DAILY_READING_MISSION_KEY = "hanyuPracticeDailyReadingMission_v1";

interface DailyReadingMissionSession {
  dateKey: string;
  chosen: string[];
  groups: QuestionGroup[];
}

export interface ReadingMissionContent {
  chosen: string[];
  groups: QuestionGroup[];
}

export function loadTodaysReadingMission(): ReadingMissionContent | null {
  try {
    const raw = localStorage.getItem(DAILY_READING_MISSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyReadingMissionSession;
    if (parsed.dateKey !== dateKey(Date.now())) return null;
    return { chosen: parsed.chosen, groups: parsed.groups };
  } catch {
    return null;
  }
}

export function saveTodaysReadingMission(content: ReadingMissionContent): void {
  try {
    localStorage.setItem(
      DAILY_READING_MISSION_KEY,
      JSON.stringify({ dateKey: dateKey(Date.now()), chosen: content.chosen, groups: content.groups })
    );
  } catch {
    // ignore -- e.g. storage disabled/full; just means no pinning today
  }
}
