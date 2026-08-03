import { useAppDispatch, useAppState } from "../../state/AppStateContext";
import { CATEGORIES, CATEGORY_SUBJECTS, SUBJECTS, QUESTION_GROUPS } from "../../data/questions";
import { selectTypeSessionGroups } from "../../lib/typeSession";

// Picker-level grouping of the underlying data categories (CATEGORIES in
// questions.ts) into the buttons shown on this screen -- Hanyu Pinyin,
// Vocabulary, Phrase Meaning, and Correct Usage are one combined "Vocabulary"
// button here (toggles all four underlying categories together) since a
// student picking this doesn't think of them as separate types, while every
// other category still gets its own button. The underlying CATEGORIES keys
// are untouched (Lesson Picker and the per-category lessonIds tagging still
// need them distinct).
const TYPE_PICKER_GROUPS: { key: string; label: string; categories: string[] }[] = [
  { key: "vocabulary", label: "词语运用 Vocabulary", categories: ["pinyin", "vocab", "phrase", "usage"] },
  { key: "conjunction", label: CATEGORIES.conjunction.label, categories: ["conjunction"] },
  { key: "sentence", label: CATEGORIES.sentence.label, categories: ["sentence"] },
  { key: "cloze", label: CATEGORIES.cloze.label, categories: ["cloze"] },
  { key: "errorcorrect", label: CATEGORIES.errorcorrect.label, categories: ["errorcorrect"] },
  { key: "comprehension", label: CATEGORIES.comprehension.label, categories: ["comprehension"] },
  { key: "dialogue", label: CATEGORIES.dialogue.label, categories: ["dialogue"] },
  { key: "practical", label: CATEGORIES.practical.label, categories: ["practical"] }
];

// Whether at least one of a group's underlying categories has a question
// under the given subject -- greyed out/unclickable otherwise (e.g.
// Vocabulary, Conjunctions, Sentence Completion, Dialogue Completion, and
// Practical Text don't exist under Higher Chinese).
function groupApplicable(categories: string[], subject: string): boolean {
  if (subject === "All") return true;
  return categories.some((k) => CATEGORY_SUBJECTS[k]?.has(subject));
}

export function TypePicker() {
  const dispatch = useAppDispatch();
  const state = useAppState();

  function startTypeQuiz() {
    if (state.selectedCategories.size === 0) {
      alert("请至少选择一种题型 Please choose at least one question type.");
      return;
    }
    const groups = QUESTION_GROUPS.filter((g) => {
      if (!state.selectedCategories.has(g.category)) return false;
      if (state.selectedSubject !== "All" && g.subject !== state.selectedSubject) return false;
      return true;
    });
    if (groups.length === 0) {
      alert("没有符合条件的题目，请调整选择。 No matching questions, please adjust your selection.");
      return;
    }
    const label = TYPE_PICKER_GROUPS.filter((g) => g.categories.every((k) => state.selectedCategories.has(k)))
      .map((g) => g.label)
      .join("、");
    dispatch({
      type: "START_QUIZ",
      mode: "type",
      modeLabel: "按题型 " + label,
      groups: selectTypeSessionGroups(groups)
    });
  }

  return (
    <div className="screen picker">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        ← 返回 Back
      </button>
      <h1>按题型练习 Practice by Question Type</h1>
      <p className="subtitle">选择科目和题型 Choose subject and question type(s)</p>
      <div className="subject-row">
        <span className="field-label">科目 Subject:</span>
        {["All", ...SUBJECTS].map((s) => (
          <button
            key={s}
            className={"chip" + (state.selectedSubject === s ? " chip-active" : "")}
            onClick={() => dispatch({ type: "SELECT_SUBJECT", subject: s })}
          >
            {s === "All" ? "全部 All" : s}
          </button>
        ))}
      </div>
      <div className="category-grid">
        {TYPE_PICKER_GROUPS.map(({ key, label, categories }) => {
          const active = categories.every((k) => state.selectedCategories.has(k));
          const applicable = groupApplicable(categories, state.selectedSubject);
          return (
            <button
              key={key}
              className={"category-btn" + (active ? " category-active" : "") + (!applicable ? " category-disabled" : "")}
              disabled={!applicable}
              onClick={() => dispatch({ type: "TOGGLE_CATEGORY_GROUP", keys: categories })}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="action-row">
        <button className="primary-btn" onClick={startTypeQuiz}>
          开始练习 Start Practice
        </button>
      </div>
    </div>
  );
}
