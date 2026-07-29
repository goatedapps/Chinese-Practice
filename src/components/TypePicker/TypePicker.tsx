import { useAppDispatch, useAppState } from "../../state/AppStateContext";
import { CATEGORIES, SUBJECTS, QUESTION_GROUPS } from "../../data/questions";
import { shuffle } from "../../lib/shuffle";

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
    dispatch({
      type: "START_QUIZ",
      mode: "type",
      modeLabel: "按题型 " + Array.from(state.selectedCategories).map((k) => CATEGORIES[k].label).join("、"),
      groups: shuffle(groups)
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
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const active = state.selectedCategories.has(key);
          return (
            <button
              key={key}
              className={"category-btn" + (active ? " category-active" : "")}
              onClick={() => dispatch({ type: "TOGGLE_CATEGORY", key })}
            >
              {cat.label}
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
