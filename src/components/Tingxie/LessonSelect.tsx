import { useEffect } from "react";
import { fetchTingxieLessonIndex, fetchTingxieLesson } from "../../data/tingxie";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";

export function LessonSelect() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();

  function loadIndex() {
    dispatch({ type: "LOAD_INDEX_START" });
    fetchTingxieLessonIndex()
      .then((index) => dispatch({ type: "LOAD_INDEX_SUCCESS", index }))
      .catch((err: Error) => dispatch({ type: "LOAD_INDEX_ERROR", error: err.message }));
  }

  useEffect(() => {
    if (state.lessonIndex) return;
    loadIndex();
    // Runs once on mount; retry() below re-fetches explicitly on click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectLesson(id: number, title: string) {
    dispatch({ type: "SELECT_LESSON_START" });
    fetchTingxieLesson(id)
      .then((lesson) => {
        dispatch({
          type: "SELECT_LESSON_SUCCESS",
          content: { title: title || lesson.title, vocab: lesson.vocab, sentences: lesson.sentences, sentenceBank: lesson.sentenceBank, isCustomReview: false }
        });
      })
      .catch((err: Error) => dispatch({ type: "SELECT_LESSON_ERROR", error: err.message }));
  }

  return (
    <div className="tingxie-select">
      <h1>听写练习 Dictation Practice</h1>

      {state.loadingIndex && <p className="tingxie-loading">加载中... Loading...</p>}

      {state.indexError && (
        <div className="tingxie-error">
          <p>{state.indexError}</p>
          <button className="secondary-btn" onClick={loadIndex}>
            重试 Retry
          </button>
        </div>
      )}

      {state.lessonError && <p className="tingxie-error-inline">{state.lessonError}</p>}
      {state.loadingLesson && <p className="tingxie-loading">加载课程中... Loading lesson...</p>}

      {state.lessonIndex && (
        <>
          <div className="lesson-grid">
            {state.lessonIndex.map((entry) => (
              <button key={entry.id} className="lesson-btn" onClick={() => selectLesson(entry.id, entry.title)}>
                <div className="lesson-btn-num">{`第 ${entry.id} 课`}</div>
              </button>
            ))}
          </div>
          <button className="secondary-btn tingxie-review-btn" onClick={() => dispatch({ type: "GO_PICKER" })}>
            🔀 自由复习 Custom Review
          </button>
        </>
      )}
    </div>
  );
}
