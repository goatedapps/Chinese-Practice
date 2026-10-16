import { parse as parseYaml } from "yaml";
import type { MCQOption, Passage, Question, QuestionGroup } from "./types";

// Flat categories contain one MCQ per record; subject and marks may override
// the Chinese / 2-mark defaults without requiring a passage-group wrapper.
const FLAT_CATEGORIES = new Set(["pinyin", "vocab", "phrase", "usage", "conjunction", "sentence"]);

// Passage-group categories where `subject`/`format` is constant across every
// group in the file today (verified categorically against the actual data,
// not just per-group) -- so the source YAML omits it and this fills the
// default back in on load. cloze/comprehension have no entry here since
// Chinese/Higher Chinese and MCQ/Fill-in/Long-Answer/Writing-Constrained are
// genuinely mixed within those two files, so `subject`/`format` stay
// required per-group/per-question fields there.
const CATEGORY_DEFAULT_SUBJECT: Partial<Record<string, string>> = {
  dialogue: "Chinese",
  errorcorrect: "Higher Chinese",
  practical: "Chinese"
};
const CATEGORY_DEFAULT_FORMAT: Partial<Record<string, string>> = {
  dialogue: "MCQ",
  errorcorrect: "Fill-in"
};
// Omitted marks use the common 2-mark value; files override other scoring.
const DEFAULT_MARKS = 2;

function toOptions(list: string[]): MCQOption[] {
  return list.map((text, i) => ({ key: String(i + 1), text }));
}

function findOptionKey(options: MCQOption[], correctText: string, where: string): string {
  const match = options.find((o) => o.text === correctText);
  if (!match) throw new Error(`"correct" value "${correctText}" does not match any option (${where})`);
  return match.key;
}

interface RawFlatRecord {
  questionID: string;
  subject?: string;
  marks?: number;
  lessonIds: number[];
  question: string;
  options: string[];
  correct: string;
}

function expandFlatRecord(category: string, raw: RawFlatRecord): Omit<QuestionGroup, "lessonEligible"> {
  const options = toOptions(raw.options);
  const correctKey = findOptionKey(options, raw.correct, raw.questionID);
  return {
    groupId: raw.questionID,
    subject: raw.subject ?? "Chinese",
    category,
    lessonIds: raw.lessonIds,
    passage: null,
    questions: [
      { qNo: "", marks: raw.marks ?? DEFAULT_MARKS, format: "MCQ", text: raw.question, options, correctKey } as Question
    ]
  };
}

interface RawGroupQuestion {
  marks?: number;
  format?: string;
  text: string;
  context?: string;
  notes?: string;
  options?: string[]; // MCQ with its own options -- omitted when the group's optionBank is used instead
  correct?: string; // MCQ only -- matches an option's (own or bank) text
  accepted?: string[]; // Fill-in only
  displayAnswer?: string; // Fill-in / Long-Answer / Writing-Constrained
}

interface RawGroup {
  groupId: string;
  subject?: string;
  // Omitted for categories where no group is ever lesson-tagged (cloze/
  // comprehension -- both lessonMode:false, so lessonIds was always [] and
  // never read by anything, see CATEGORIES above); defaults to [] on load.
  lessonIds?: number[];
  passage: Passage | null;
  optionBank?: string[];
  questions: RawGroupQuestion[];
}

function expandGroup(category: string, raw: RawGroup): Omit<QuestionGroup, "lessonEligible"> {
  const subject = raw.subject ?? CATEGORY_DEFAULT_SUBJECT[category];
  if (!subject) throw new Error(`Group "${raw.groupId}" (${category}) is missing "subject" and this category has no default`);
  const optionBank = raw.optionBank ? toOptions(raw.optionBank) : undefined;

  const questions = raw.questions.map((rq): Question => {
    const format = rq.format ?? CATEGORY_DEFAULT_FORMAT[category];
    if (!format) throw new Error(`A question in group "${raw.groupId}" (${category}) is missing "format" and this category has no default`);
    const marks = rq.marks ?? DEFAULT_MARKS;
    const base = { qNo: "", marks, text: rq.text, context: rq.context, notes: rq.notes };

    if (format === "MCQ") {
      const options = rq.options ? toOptions(rq.options) : undefined;
      const bank = options ?? optionBank;
      if (!bank) throw new Error(`MCQ question in group "${raw.groupId}" has no options and the group has no optionBank`);
      if (rq.correct === undefined) throw new Error(`MCQ question in group "${raw.groupId}" is missing "correct"`);
      const correctKey = findOptionKey(bank, rq.correct, raw.groupId);
      return { ...base, format: "MCQ", options, correctKey } as Question;
    }
    if (format === "Fill-in") {
      return { ...base, format: "Fill-in", accepted: rq.accepted ?? [], displayAnswer: rq.displayAnswer ?? "" } as Question;
    }
    // Long-Answer / Writing-Constrained
    return { ...base, format: format as "Long-Answer" | "Writing-Constrained", displayAnswer: rq.displayAnswer ?? "" } as Question;
  });

  return { groupId: raw.groupId, subject, category, lessonIds: raw.lessonIds ?? [], passage: raw.passage, optionBank, questions };
}

// Pure YAML-text -> QuestionGroup[] parser (no fetch, no cache) -- shared by
// fetchQuestionCategory() below and scripts/build-content-index.ts, so the
// index-rebuild script gets the exact same expansion/validation (e.g. a
// "correct" typo that doesn't match any option throws in both places) rather
// than a second hand-maintained copy of this logic.
export function parseQuestionCategoryYaml(category: string, yamlText: string): QuestionGroup[] {
  const raw = parseYaml(yamlText) as unknown[];
  const expanded = FLAT_CATEGORIES.has(category)
    ? (raw as RawFlatRecord[]).map((r) => expandFlatRecord(category, r))
    : (raw as RawGroup[]).map((g) => expandGroup(category, g));
  return expanded.map((g) => ({
    ...g,
    lessonEligible: g.lessonIds.length > 0,
    questions: g.questions.map((q, i) => ({ ...q, qNo: `${g.groupId}-${i}` }))
  }));
}
