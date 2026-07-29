import { useAppDispatch } from "../../state/AppStateContext";
import { LESSON_COUNT, QUESTION_GROUPS } from "../../data/questions";
import { shuffle } from "../../lib/shuffle";

export function LessonPicker() {
  const dispatch = useAppDispatch();

  function startLessonQuiz(lessonNum: number) {
    const groups = QUESTION_GROUPS.filter((g) => g.lessonEligible && g.lessonIds.includes(lessonNum));
    dispatch({
      type: "START_QUIZ",
      mode: "lesson",
      modeLabel: `第 ${lessonNum} 课 Lesson ${lessonNum}`,
      groups: shuffle(groups)
    });
  }

  return (
    <div className="screen picker">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        ← 返回 Back
      </button>
      <h1>按课文练习 Practice by Lesson</h1>
      <p className="subtitle">选择一课 Choose a lesson</p>
      <div className="lesson-grid">
        {Array.from({ length: LESSON_COUNT }, (_, i) => i + 1).map((n) => {
          const count = QUESTION_GROUPS.filter((g) => g.lessonEligible && g.lessonIds.includes(n)).reduce(
            (sum, g) => sum + g.questions.length,
            0
          );
          return (
            <button
              key={n}
              className={"lesson-btn" + (count === 0 ? " disabled" : "")}
              onClick={() => {
                if (count > 0) startLessonQuiz(n);
              }}
            >
              <div className="lesson-btn-num">{`第 ${n} 课`}</div>
              <div className="lesson-btn-count">{count > 0 ? `${count} 题` : "暂无题目"}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
