import type { QuestionGroup, MCQOption } from "../data/types";
import { shuffle } from "./shuffle";

// Shuffles one option list and reassigns keys "1", "2", "3", ... in the new
// order -- the authored key is just a display/lookup label, never read for
// its value by grading (lib/grading.ts) or rendering (Quiz.tsx), so a fresh
// key sequence is safe as long as it's applied consistently with the
// correctKey remap below.
function reshuffleOptions(options: MCQOption[]): { options: MCQOption[]; keyMap: Map<string, string> } {
  const keyMap = new Map<string, string>();
  const next = shuffle(options).map((opt, i) => {
    const newKey = String(i + 1);
    keyMap.set(opt.key, newKey);
    return { ...opt, key: newKey };
  });
  return { options: next, keyMap };
}

// Randomizes MCQ option order for one group, fresh on every call -- meant to
// be applied once per group as a session is built (see
// lib/typeSession.ts's selectTypeSessionGroups()), never at fetch/cache
// time, so the same authored question shows a different order each session
// rather than a fixed shuffle baked in once. Always returns a new object
// (never mutates `group` or its questions/options in place) since fetched
// groups are cached in data/questions.ts's module-level Map and reused
// across every future session.
export function shuffleMcqOptions(group: QuestionGroup): QuestionGroup {
  if (!group.questions.some((q) => q.format === "MCQ")) return group;

  // Dialogue-completion-style groups: one shared bank rendered once (the
  // "词语库 Word Bank" box, Quiz.tsx) and reused by every question in the
  // group -- shuffle it once so the box and every question's radio options
  // stay in sync, then remap each question's own correctKey.
  if (group.optionBank) {
    const { options: bank, keyMap } = reshuffleOptions(group.optionBank);
    return {
      ...group,
      optionBank: bank,
      questions: group.questions.map((q) =>
        q.format === "MCQ" ? { ...q, correctKey: keyMap.get(q.correctKey) ?? q.correctKey } : q
      )
    };
  }

  // Otherwise each MCQ question carries its own independent options list.
  return {
    ...group,
    questions: group.questions.map((q) => {
      if (q.format !== "MCQ" || !q.options) return q;
      const { options, keyMap } = reshuffleOptions(q.options);
      return { ...q, options, correctKey: keyMap.get(q.correctKey) ?? q.correctKey };
    })
  };
}
