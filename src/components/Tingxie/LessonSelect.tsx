import { useEffect, useState } from "react";
import { fetchTingxieLessonIndex, fetchTingxieLesson, prefetchTingxieLessons } from "../../data/tingxie";
import { isTingxieMissionComplete } from "../../lib/stats";
import { shouldNudgeForLesson } from "../../state/lessonFrequency";
import { ConfirmModal } from "../common/Modal";
import { Icon } from "../common/Icons";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";

export function LessonSelect() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  // Non-null while the "you've practiced this a lot lately" nudge modal is
  // showing, holding the lesson pending confirmation. See
  // state/lessonFrequency.ts.
  const [nudgeLesson, setNudgeLesson] = useState<{ id: number; title: string } | null>(null);
  // Reads localStorage directly (no hist needed, unlike the lesson-revision
  // mission) -- see lib/stats.ts's isTingxieMissionComplete(). Self-hides
  // once today's "听写练习" mission is done, same reasoning as Practice.tsx's
  // hint box.
  const dictationMissionDone = isTingxieMissionComplete();

  function loadIndex() {
    dispatch({ type: "LOAD_INDEX_START" });
    fetchTingxieLessonIndex()
      .then((index) => {
        dispatch({ type: "LOAD_INDEX_SUCCESS", index });
        prefetchTingxieLessons(index);
      })
      .catch((err: Error) => dispatch({ type: "LOAD_INDEX_ERROR", error: err.message }));
  }

  useEffect(() => {
    if (state.lessonIndex) return;
    loadIndex();
    // Runs once on mount; retry() below re-fetches explicitly on click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectLesson(id: number, title: string, reducedBP = false) {
    dispatch({ type: "SELECT_LESSON_START" });
    fetchTingxieLesson(id)
      .then((lesson) => {
        dispatch({
          type: "SELECT_LESSON_SUCCESS",
          content: {
            title: title || lesson.title,
            vocab: lesson.vocab,
            sentences: lesson.sentences,
            applyVocab: lesson.vocab,
            isCustomReview: false,
            lessonId: id,
            reducedBP
          }
        });
      })
      .catch((err: Error) => dispatch({ type: "SELECT_LESSON_ERROR", error: err.message }));
  }

  function handleLessonClick(id: number, title: string) {
    if (shouldNudgeForLesson(id)) {
      setNudgeLesson({ id, title });
      return;
    }
    selectLesson(id, title);
  }

  return (
    <div className="tingxie-select">
      <h1 className="tingxie-select-title">
        <Icon name="sparkle" className="tingxie-select-title-spark" />
        <img className="tingxie-select-title-icon" src="/icons/dictatation-mission.png" alt="" />
        听写练习 Dictation Practice
        <Icon name="sparkle" className="tingxie-select-title-spark" />
      </h1>

      {state.lessonIndex && (
        <div className="lesson-count-badge">
          <Icon name="star" />
          共有 {state.lessonIndex.length} 个课程
        </div>
      )}

      {!dictationMissionDone && (
        <div className="mission-hint-box">
          <img className="mission-hint-icon" src="/icons/todays-mission.png" alt="" />
          <span>To complete today's "Dictation Lesson" mission: pick any lesson and finish one activity (Learn / Apply / Test).</span>
        </div>
      )}

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
              <button key={entry.id} className="lesson-btn" onClick={() => handleLessonClick(entry.id, entry.title)}>
                <div className="lesson-btn-num">{`第 ${entry.id} 课`}</div>
              </button>
            ))}
          </div>
          <button className="secondary-btn tingxie-review-btn" onClick={() => dispatch({ type: "GO_PICKER" })}>
            🔀 自由复习 Custom Review
          </button>
        </>
      )}

      {nudgeLesson && (
        <ConfirmModal
          messageLines={[
            `You've practiced lesson ${nudgeLesson.id} a lot lately — try a different lesson?`,
            "Continuing will only earn half BP this time."
          ]}
          cancelLabel="Pick a different lesson"
          confirmLabel="Continue anyway (50% BP)"
          onCancel={() => setNudgeLesson(null)}
          onConfirm={() => {
            const lesson = nudgeLesson;
            setNudgeLesson(null);
            selectLesson(lesson.id, lesson.title, true);
          }}
        />
      )}
    </div>
  );
}
