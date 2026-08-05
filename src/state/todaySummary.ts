// Same-day-only detail backing the Home screen's "Today's Session Summary"
// PDF (see exportTodaySummaryToPdf() in lib/exportPdf.ts). Deliberately
// separate from history.ts: history.ts keeps a lightweight lifetime summary
// (score/mode per session, capped at 50 entries, no question-level detail),
// while this store keeps the full per-question detail (Practice) and
// self-graded misses (Tingxie) needed to reconstruct a real answer sheet --
// but ONLY for today, auto-discarded once the calendar day rolls over, so it
// never grows into a second unbounded, ever-larger copy of practice history.
import type { QuestionGroup, GroupResult } from "../data/types";
import { dateKey } from "../lib/stats";
import { loadJSON } from "../lib/storage";
import { makeId } from "../lib/id";

const TODAY_SUMMARY_KEY = "hanyuPracticeTodaySummary_v1";
const MAX_PRACTICE_SESSIONS = 20;
const MAX_TINGXIE_WRONG = 100;
const MAX_STORIES_READ = 50;

export interface TodayPracticeSession {
  id: string;
  date: number;
  modeLabel: string;
  groups: QuestionGroup[];
  results: GroupResult[];
}

export interface TodayTingxieWrong {
  id: string;
  date: number;
  activity: "apply" | "practice";
  kind: "vocab" | "sentence";
  lessonTitle: string;
  prompt: string;
  answer: string;
}

export interface TodayStoryRead {
  id: string;
  date: number;
  lessonId: number;
}

interface TodaySummaryStore {
  dateKey: string;
  practiceSessions: TodayPracticeSession[];
  tingxieWrong: TodayTingxieWrong[];
  storiesRead: TodayStoryRead[];
}

function emptyStore(): TodaySummaryStore {
  return { dateKey: dateKey(Date.now()), practiceSessions: [], tingxieWrong: [], storiesRead: [] };
}

// Discards (and re-persists empty) any stored data from a previous calendar
// day -- this, not a size cap, is what actually keeps the store bounded.
function loadStore(): TodaySummaryStore {
  const raw = loadJSON<TodaySummaryStore | null>(TODAY_SUMMARY_KEY, null);
  // `storiesRead` defaults to [] for a same-day store saved before that
  // field existed -- same "missing means no data" backward-compat as
  // HistoryEntry.categoryCounts, so a stale stored value from earlier today
  // can't crash the spreads in recordTodayStoryRead() below.
  if (raw && raw.dateKey === dateKey(Date.now())) return { ...raw, storiesRead: raw.storiesRead ?? [] };
  const fresh = emptyStore();
  localStorage.setItem(TODAY_SUMMARY_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveStore(store: TodaySummaryStore): void {
  localStorage.setItem(TODAY_SUMMARY_KEY, JSON.stringify(store));
}

export function getTodaySummary(): {
  practiceSessions: TodayPracticeSession[];
  tingxieWrong: TodayTingxieWrong[];
  storiesRead: TodayStoryRead[];
} {
  const store = loadStore();
  return { practiceSessions: store.practiceSessions, tingxieWrong: store.tingxieWrong, storiesRead: store.storiesRead };
}

export function recordTodayPracticeSession(entry: Omit<TodayPracticeSession, "id" | "date">): void {
  const store = loadStore();
  const next: TodayPracticeSession = { ...entry, id: makeId(), date: Date.now() };
  store.practiceSessions = [...store.practiceSessions, next].slice(-MAX_PRACTICE_SESSIONS);
  saveStore(store);
}

// Dedup by kind+answer -- Apply/Practice's front-shrink/back-requeue queue
// mechanic can resurface the same missed word/sentence more than once in a
// single pass, and this store should read as "things that gave the student
// trouble today", not a raw event log with repeats.
export function recordTingxieWrong(entry: Omit<TodayTingxieWrong, "id" | "date">): void {
  const store = loadStore();
  const withoutDup = store.tingxieWrong.filter((w) => !(w.kind === entry.kind && w.answer === entry.answer));
  const next: TodayTingxieWrong = { ...entry, id: makeId(), date: Date.now() };
  store.tingxieWrong = [...withoutDup, next].slice(-MAX_TINGXIE_WRONG);
  saveStore(store);
}

// Called from Story.tsx's finishStory() -- no dedup, same reasoning as
// achievements.ts's "storyCompleted" achievement (re-reading a lesson today
// is a real, repeatable event, not a one-time milestone).
export function recordTodayStoryRead(lessonId: number): void {
  const store = loadStore();
  const next: TodayStoryRead = { id: makeId(), date: Date.now(), lessonId };
  store.storiesRead = [...store.storiesRead, next].slice(-MAX_STORIES_READ);
  saveStore(store);
}
