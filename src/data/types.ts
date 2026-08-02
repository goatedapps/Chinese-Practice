export interface Category {
  label: string;
  lessonMode: boolean;
}

export interface MCQOption {
  key: string;
  text: string;
}

interface QuestionBase {
  qNo: string;
  marks: number;
  text: string;
  context?: string;
  notes?: string;
}

export interface MCQQuestion extends QuestionBase {
  format: "MCQ";
  // Omitted when the group provides a shared `optionBank` instead.
  options?: MCQOption[];
  correctKey: string;
}

export interface FillInQuestion extends QuestionBase {
  format: "Fill-in";
  accepted: string[];
  displayAnswer: string;
}

// Long-Answer and Writing-Constrained are graded identically (self-checked
// by the student against a model answer) -- see gradeGroup()'s `else`
// branch in the original app.js, which never distinguished between them.
export interface SelfCheckQuestion extends QuestionBase {
  format: "Long-Answer" | "Writing-Constrained";
  displayAnswer: string;
}

export type Question = MCQQuestion | FillInQuestion | SelfCheckQuestion;

export interface Passage {
  title: string;
  source?: string;
  text: string;
}

export interface QuestionGroup {
  groupId: string;
  subject: string;
  paper: string;
  section: string;
  category: string;
  lessonEligible: boolean;
  lessonIds: number[];
  passage: Passage | null;
  // Shared MCQ option bank (e.g. dialogue-completion): shown once, questions
  // reference option keys instead of repeating them via their own `options`.
  optionBank?: MCQOption[];
  questions: Question[];
}

export interface GroupResultItem {
  qNo: string;
  marks: number;
  correct: boolean | null;
  skipped: boolean;
  bpAwarded?: boolean;
  // The student's raw answer -- MCQ option key, typed Fill-in text, or typed
  // Long-Answer/Writing-Constrained text. Kept (not discarded after grading)
  // so the PDF export in lib/exportPdf.ts can show what was actually typed.
  answer?: string;
}

export interface GroupResult {
  groupId: string;
  items: GroupResultItem[];
}

export interface HistoryEntry {
  id: string;
  date: number;
  modeLabel: string;
  totalItems: number;
  correctItems: number;
  skippedItems: number;
  // Which practice mode this session was -- mirrors AppState.mode. Needed to
  // detect the "revise a lesson" mission (any lesson-mode session today,
  // regardless of which lesson number). Optional/absent on pre-Phase-2
  // entries, same forward-compat story as categoryCounts below.
  mode?: "lesson" | "type";
  // Groups completed this session, keyed by QuestionGroup.category. Optional
  // and absent on any entry saved before this change -- every reader treats
  // a missing value as "no data" via `?? {}`, never crashes.
  categoryCounts?: Record<string, number>;
}

export interface PetStage {
  key: string;
  label: string;
  // Age (in years -- see GROWTH_PER_AGE_YEAR in data/pet.ts) at which the
  // pet evolves into this stage. Age itself is derived from raw `growth`
  // points (earned by feeding, unchanged), never stored directly.
  minAgeYears: number;
}

export interface ShopItem {
  id: string;
  label: string;
  type: "food" | "toy";
  cost: number;
  growth: number;
  mood: number;
}

export interface PurchaseHistoryEntry {
  itemId: string;
  cost: number;
  ts: number;
}

export interface PetState {
  name: string;
  bp: number;
  bpLifetime: number;
  growth: number;
  moodAtCheckpoint: number;
  lastFedAt: number;
  purchaseHistory: PurchaseHistoryEntry[];
  // Items bought in the Shop land here first, keyed by ShopItem id; the
  // student opens the Bag and chooses when to give each one to the owl.
  inventory: Record<string, number>;
  // Lifetime count of individual questions answered/skipped across all
  // sessions (not groups) -- drives the "every 100 questions" achievement.
  questionsLifetime: number;
}

export type MoodBucket = "sad" | "neutral" | "happy" | "very_happy";

export type AchievementType = "fed" | "evolved" | "missionComplete" | "questionsMilestone";

export interface Achievement {
  id: string;
  type: AchievementType;
  date: number;
  // fed -> ShopItem id; evolved -> new PetStage key; questionsMilestone ->
  // the milestone number as a string (e.g. "300"); missionComplete -> unused.
  detail?: string;
}

// ---- Tingxie (听写) dictation-practice mode -- shared JSON-shape interfaces
// matching public/tingxie-lessons/<id>.json 1:1. See CLAUDE.md's Tingxie
// section for how these are used.
export interface TingxieVocabItem {
  word: string;
  pinyin: string;
  meaning: string;
  example: string;
}

export interface TingxieSentence {
  text: string;
  segments: string[];
  icon: string; // Lucide icon name -- mapped to an emoji via tingxieIconEmoji()
  color: string; // Tailwind text-color class from the source data -- intentionally never read
  description: string;
}

export interface TingxieSentenceBankEntry {
  zh: string;
  en: string;
}

export interface TingxieLesson {
  title: string;
  vocab: TingxieVocabItem[];
  sentences: TingxieSentence[];
  sentenceBank: Record<string, TingxieSentenceBankEntry[]>;
}

export interface TingxieLessonIndexEntry {
  id: number;
  title: string;
}
