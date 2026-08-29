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
  category: string;
  // Computed by data/questions.ts's loader as `lessonIds.length > 0` -- not
  // an authored field in the source YAML, since it's fully redundant with
  // lessonIds (verified against all 357 groups before dropping it from the
  // schema). Kept here so every existing lessonEligible call site (e.g.
  // Practice.tsx) reads unchanged.
  lessonEligible: boolean;
  lessonIds: number[];
  passage: Passage | null;
  // Shared MCQ option bank (e.g. dialogue-completion): shown once, questions
  // reference option keys instead of repeating them via their own `options`.
  optionBank?: MCQOption[];
  questions: Question[];
}

// Lightweight per-group metadata from public/content/<level>/questions/index.yaml
// -- everything the Practice/Today's Mission/Special Quest pickers need to
// compute lesson counts and category/subject availability, without fetching
// every category's full passage/question/answer content up front. See
// data/questions.ts's fetchQuestionIndex()/fetchQuestionCategory().
export interface QuestionIndexEntry {
  groupId: string;
  subject: string;
  category: string;
  lessonIds: number[];
  questionCount: number;
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
  // AI grading (Gemini) for a self-check item -- only ever set for the family
  // accounts on the server-side allowlist (see lib/aiGrading.ts, api/grade.ts).
  // Absent for every MCQ/Fill-in item and for every self-check item graded by
  // a non-eligible user/guest, who take the unchanged manual self-check path.
  // AI grading is final -- there is no manual override.
  aiGrading?: "pending" | "done" | "failed";
  aiScore?: number; // 0..marks, Gemini's score out of this item's own `marks`
  aiFeedback?: string; // simple Chinese, points out how the answer could improve
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

export interface PetState {
  name: string;
  bp: number;
  growth: number;
  moodAtCheckpoint: number;
  lastFedAt: number;
  // Anchor for growth-decay-from-neglect accounting (see PetContext.tsx's
  // settleGrowthDecay()) -- advances by whole days consumed each time decay
  // is applied while mood sits at 0, and resets to "now" the moment mood
  // rises back above 0. Absent on pre-this-feature saves; loadPetState()'s
  // merge with PET_DEFAULT_STATE backfills it to "now" so an old save never
  // takes a retroactive growth penalty for neglect that predates the field.
  growthDecayCheckpointAt: number;
  // Items bought in the Shop land here first, keyed by ShopItem id; the
  // student opens the Bag and chooses when to give each one to the owl.
  inventory: Record<string, number>;
  // Lifetime count of individual questions answered/skipped across all
  // sessions (not groups) -- drives the "every 100 questions" achievement.
  questionsLifetime: number;
}

export type MoodBucket = "sad" | "neutral" | "happy" | "very_happy";

export type AchievementType = "missionComplete" | "questionsMilestone" | "storyCompleted" | "specialQuestComplete" | "tingxieCompleted";

// Tingxie's 5 award sites (Learn's two sub-activities are awarded/logged
// separately -- see CLAUDE.md's Tingxie BP bullet), matching
// TingxieActiveContent.title + which one just finished.
export type TingxieCompletedActivity = "learnVocab" | "learnSentence" | "apply" | "play" | "test";

export interface Achievement {
  id: string;
  type: AchievementType;
  date: number;
  // questionsMilestone -> the milestone number as a string (e.g. "300");
  // storyCompleted -> the lesson number as a string (e.g. "5");
  // specialQuestComplete -> the completed SpecialQuestConfig.id (e.g. "petFull");
  // tingxieCompleted -> `${lessonTitle}|${TingxieCompletedActivity}`, e.g.
  //   "第一课 (Lesson 1)|apply" -- see RecentAchievements.tsx's describe().
  // missionComplete -> unused.
  detail?: string;
}

// ---- Tingxie (听写) dictation-practice mode -- shared shape interfaces
// matching public/content/<level>/tingxie/<id>.yaml 1:1. See CLAUDE.md's
// Tingxie section for how these are used.
export interface TingxieSentenceBankEntry {
  zh: string;
  en: string;
}

export interface TingxieVocabItem {
  word: string;
  pinyin: string;
  meaning: string;
  example: string;
  // Extra example sentences used by the Apply activity's blank-fill exercise
  // -- absent for a word with none. Nested here (rather than a separate
  // top-level sentenceBank map keyed by word) since every word's bank
  // entries only ever apply to that same word -- see CLAUDE.md.
  sentenceBank?: TingxieSentenceBankEntry[];
}

export interface TingxieSentence {
  text: string;
  segments: string[];
  icon: string; // Lucide icon name -- mapped to an emoji via tingxieIconEmoji()
  description: string;
}

export interface TingxieLesson {
  title: string;
  vocab: TingxieVocabItem[];
  sentences: TingxieSentence[];
}

export interface TingxieLessonIndexEntry {
  id: number;
  title: string;
}

// A word a student flagged for extra revision via "Add to My Vocab" in
// Learn/Apply/Test. word/pinyin/meaning/example are captured at save-time
// (not re-fetched from the lesson), so a saved entry still displays
// correctly even if the source content changes later.
export interface MyVocabEntry {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  example: string;
  lessonId: number | null;
  lessonTitle: string;
  savedAt: number;
}
