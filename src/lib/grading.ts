import type { Question, QuestionGroup, GroupResultItem, MCQOption } from "../data/types";

export function normalize(s: string | undefined): string {
  return (s || "").toString().trim().replace(/\s+/g, "");
}

export function isSelfCheckFormat(format: string): boolean {
  return format === "Long-Answer" || format === "Writing-Constrained";
}

export interface AnswerMap {
  [qNo: string]: string; // radio key for MCQ, typed text for Fill-in
}

// Grades everything gradeable immediately (MCQ/Fill-in). Long-Answer /
// Writing-Constrained questions come back unresolved (correct: null) since
// the student self-checks those against a model answer after submitting --
// see UPDATE_ITEM_RESULT in AppStateContext for how that gets filled in later.
export function gradeQuestion(question: Question, answer: string | undefined): GroupResultItem {
  if (question.format === "MCQ") {
    const chosen = answer || null;
    const correct = chosen === question.correctKey;
    return { qNo: question.qNo, marks: question.marks, correct, skipped: !chosen, answer };
  }
  if (question.format === "Fill-in") {
    const val = normalize(answer);
    const correct = question.accepted.some((a) => normalize(a) === val);
    return { qNo: question.qNo, marks: question.marks, correct, skipped: !val, answer };
  }
  return { qNo: question.qNo, marks: question.marks, correct: null, skipped: true, bpAwarded: false, answer };
}

export function gradeGroup(group: QuestionGroup, answers: AnswerMap): GroupResultItem[] {
  return group.questions.map((q) => gradeQuestion(q, answers[q.qNo]));
}

export function correctOptionFor(
  question: Question & { format: "MCQ" },
  group: QuestionGroup
): MCQOption | undefined {
  const bank = group.optionBank ?? question.options ?? [];
  return bank.find((o) => o.key === question.correctKey);
}
