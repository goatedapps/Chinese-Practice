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
  answerSource?: string;
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
}

export interface PetStage {
  key: string;
  label: string;
  minGrowth: number;
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
  bp: number;
  bpLifetime: number;
  growth: number;
  moodAtCheckpoint: number;
  lastFedAt: number;
  purchaseHistory: PurchaseHistoryEntry[];
  // Items bought in the Shop land here first, keyed by ShopItem id; the
  // student opens the Bag and chooses when to give each one to the owl.
  inventory: Record<string, number>;
}

export type MoodBucket = "sad" | "neutral" | "happy" | "very_happy";
