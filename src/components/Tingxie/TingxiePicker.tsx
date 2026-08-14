import { useEffect } from "react";
import { fetchTingxieLessonIndex, fetchTingxieLesson, pooledTingxieReview } from "../../data/tingxie";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";

export function TingxiePicker() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();

  useEffect(() => {
    if (state.lessonIndex) return;
    dispatch({ type: "LOAD_INDEX_START" });
    fetchTingxieLessonIndex()
      .then((index) => dispatch({ type: "LOAD_INDEX_SUCCESS", index }))
      .catch((err: Error) => dispatch({ type: "LOAD_INDEX_ERROR", error: err.message }));
    // Runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allIds = state.lessonIndex?.map((e) => e.id) ?? [];
  const allSelected = allIds.length > 0 && allIds.every((id) => state.pickerSelectedIds.includes(id));

  function startReview(target: "apply" | "play" | "practice") {
    if (state.pickerSelectedIds.length === 0) return;
    dispatch({ type: "CUSTOM_REVIEW_START" });
    Promise.all(state.pickerSelectedIds.map((id) => fetchTingxieLesson(id)))
      .then((lessons) => {
        const pooled = pooledTingxieReview(lessons);
        dispatch({
          type: "CUSTOM_REVIEW_SUCCESS",
          target,
          content: { title: "自由复习 Custom Review", vocab: pooled.vocab, sentences: pooled.sentences, applyVocab: pooled.applyVocab, isCustomReview: true }
        });
      })
      .catch((err: Error) => dispatch({ type: "CUSTOM_REVIEW_ERROR", error: err.message }));
  }

  return (
    <div className="tingxie-picker">
      <h1>自由复习 Custom Review</h1>
      <p className="subtitle">选择多课，混合练习 Pick multiple lessons to mix together</p>

      {state.loadingIndex && <p className="tingxie-loading">加载中... Loading...</p>}
      {state.indexError && <p className="tingxie-error-inline">{state.indexError}</p>}
      {state.reviewError && <p className="tingxie-error-inline">{state.reviewError}</p>}
      {state.loadingReview && <p className="tingxie-loading">正在准备复习内容... Preparing review content...</p>}

      {state.lessonIndex && (
        <>
          <button className="secondary-btn tingxie-picker-all-btn" onClick={() => dispatch({ type: "TOGGLE_PICKER_ALL", allIds })}>
            {allSelected ? "取消全选 Deselect All" : "全选 Select All"}
          </button>

          <div className="tingxie-picker-list">
            {state.lessonIndex.map((entry) => {
              const checked = state.pickerSelectedIds.includes(entry.id);
              return (
                <label key={entry.id} className={"tingxie-picker-row" + (checked ? " tingxie-picker-row-checked" : "")}>
                  <input type="checkbox" checked={checked} onChange={() => dispatch({ type: "TOGGLE_PICKER_LESSON", id: entry.id })} />
                  <span>{entry.title}</span>
                </label>
              );
            })}
          </div>

          <div className="tingxie-picker-actions">
            <button className="primary-btn" disabled={state.pickerSelectedIds.length === 0 || state.loadingReview} onClick={() => startReview("apply")}>
              ✏️ 词语应用 Start Apply
            </button>
            <button className="primary-btn" disabled={state.pickerSelectedIds.length === 0 || state.loadingReview} onClick={() => startReview("play")}>
              ☁️ 词云游戏 Start Game
            </button>
            <button className="primary-btn" disabled={state.pickerSelectedIds.length === 0 || state.loadingReview} onClick={() => startReview("practice")}>
              🔊 听写测试 Start Test
            </button>
          </div>
        </>
      )}
    </div>
  );
}
