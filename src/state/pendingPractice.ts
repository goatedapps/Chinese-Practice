// Remembers the last "practice by type/lesson" session Practice.tsx started
// so leaving mid-session (via TopNav's leave-guard, the browser back button,
// etc.) and picking the exact same subject/categories/lesson(s) again later
// resumes with the same question set instead of a freshly randomized one --
// selectTypeSessionGroups() advances its own per-category round-robin queue
// on every call, so calling it again for an abandoned selection used to hand
// back different content each time. Deliberately local-only (not synced) and
// a single slot, not a history: only "the one session I most recently
// started but didn't finish" needs remembering, matching how a student
// actually thinks about resuming ("give me back what I was just doing").
import type { QuestionGroup } from "../data/types";

const PENDING_PRACTICE_KEY = "hanyuPracticePendingSession_v1";

export interface PracticeSelectionSignature {
  subject: string;
  // Both pre-sorted by the caller so signature comparison is a plain
  // index-wise equality check, not a set comparison.
  categories: string[];
  lessons: number[];
}

interface PendingPracticeSession {
  signature: PracticeSelectionSignature;
  mode: "type" | "lesson";
  modeLabel: string;
  groups: QuestionGroup[];
  reducedBP: boolean;
}

function signaturesMatch(a: PracticeSelectionSignature, b: PracticeSelectionSignature): boolean {
  return (
    a.subject === b.subject &&
    a.categories.length === b.categories.length &&
    a.categories.every((c, i) => c === b.categories[i]) &&
    a.lessons.length === b.lessons.length &&
    a.lessons.every((l, i) => l === b.lessons[i])
  );
}

// Returns the saved session only if its selection signature exactly matches
// the one being started now -- a different selection just means "not a
// resume," not an error, so this returns null rather than throwing.
export function loadPendingPracticeSession(signature: PracticeSelectionSignature): PendingPracticeSession | null {
  try {
    const raw = localStorage.getItem(PENDING_PRACTICE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPracticeSession;
    return signaturesMatch(parsed.signature, signature) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePendingPracticeSession(session: PendingPracticeSession): void {
  try {
    localStorage.setItem(PENDING_PRACTICE_KEY, JSON.stringify(session));
  } catch {
    // ignore -- e.g. storage disabled/full; just means no resume next time
  }
}

// Called once a session actually finishes (Result.tsx) -- whatever was
// pending is no longer "unfinished," so there's nothing left to resume.
export function clearPendingPracticeSession(): void {
  localStorage.removeItem(PENDING_PRACTICE_KEY);
}
