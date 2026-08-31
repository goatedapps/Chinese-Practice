import { useEffect, useState } from "react";
import type { TingxieVocabItem } from "../../data/types";
import { fetchTingxieLessonIndex, fetchTingxieLesson, prefetchTingxieLessons, pooledTingxieReview } from "../../data/tingxie";
import { isTingxieMissionComplete } from "../../lib/stats";
import { shouldNudgeForLesson } from "../../state/lessonFrequency";
import { loadMyVocab } from "../../state/myVocab";
import { ConfirmModal } from "../common/Modal";
import { Icon } from "../common/Icons";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";

// Narrows a lesson/pooled vocab list down to just the words also saved in
// My Vocab (matched by word text) -- applied to both `vocab` (Learn's
// flip-card carousel) and `applyVocab` (Apply's fill-in-blank queue), which
// is why this filters the raw TingxieVocabItem[] rather than replacing it
// with the (sentenceBank-less) MyVocabEntry records themselves: Apply still
// needs each word's real sentenceBank, which only the source lesson data
// carries.
function filterToMyVocab(vocab: TingxieVocabItem[]): TingxieVocabItem[] {
  const saved = new Set(loadMyVocab().map((e) => e.word));
  return vocab.filter((v) => saved.has(v.word));
}

// Multi-select by default (state.pickerSelectedIds, toggled via
// TOGGLE_PICKER_LESSON -- the same field/action a separate "自由复习 Custom
// Review" picker screen used to own exclusively; that screen is gone now,
// folded into this one). Exactly one lesson selected still goes through the
// original single-lesson path (selectLesson -- full Learn/Apply/Play/Test
// access, and the overpractice nudge, both tied to a single real lessonId);
// two or more pool together into a synthetic isCustomReview session (Learn
// unavailable, no single lesson to attach it to -- see
// TingxieActiveContent's own comment) and land on the Apply tab, from which
// the student can still switch to Play/Test via the normal tab bar.
export function LessonSelect() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  // Non-null while the "you've practiced this a lot lately" nudge modal is
  // showing (only ever reachable via the single-lesson path) -- see
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
    const myVocabOnly = state.myVocabOnly;
    fetchTingxieLesson(id)
      .then((lesson) => {
        const vocab = myVocabOnly ? filterToMyVocab(lesson.vocab) : lesson.vocab;
        dispatch({
          type: "SELECT_LESSON_SUCCESS",
          content: {
            title: title || lesson.title,
            vocab,
            sentences: myVocabOnly ? [] : lesson.sentences,
            applyVocab: vocab,
            isCustomReview: false,
            lessonId: id,
            reducedBP,
            isMyVocabOnly: myVocabOnly
          }
        });
      })
      .catch((err: Error) => dispatch({ type: "SELECT_LESSON_ERROR", error: err.message }));
  }

  function startCustomReview(ids: number[]) {
    dispatch({ type: "CUSTOM_REVIEW_START" });
    const myVocabOnly = state.myVocabOnly;
    Promise.all(ids.map((id) => fetchTingxieLesson(id)))
      .then((lessons) => {
        const pooled = pooledTingxieReview(lessons);
        const vocab = myVocabOnly ? filterToMyVocab(pooled.vocab) : pooled.vocab;
        const applyVocab = myVocabOnly ? filterToMyVocab(pooled.applyVocab) : pooled.applyVocab;
        dispatch({
          type: "CUSTOM_REVIEW_SUCCESS",
          target: "apply",
          content: {
            title: "自由复习 Custom Review",
            vocab,
            sentences: myVocabOnly ? [] : pooled.sentences,
            applyVocab,
            isCustomReview: true,
            isMyVocabOnly: myVocabOnly
          }
        });
      })
      .catch((err: Error) => dispatch({ type: "CUSTOM_REVIEW_ERROR", error: err.message }));
  }

  function startPractice() {
    const ids = state.pickerSelectedIds;
    if (ids.length === 0) return;
    if (ids.length > 1) {
      startCustomReview(ids);
      return;
    }
    const id = ids[0];
    const title = state.lessonIndex?.find((e) => e.id === id)?.title ?? "";
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
      {state.reviewError && <p className="tingxie-error-inline">{state.reviewError}</p>}
      {state.loadingLesson && <p className="tingxie-loading">加载课程中... Loading lesson...</p>}

      {state.lessonIndex && (
        <>
          <div className="tingxie-my-vocab-toggle-row">
            <span className="tingxie-difficulty-label">
              只显示我的词库 My Vocab Only
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={state.myVocabOnly}
              aria-label="只显示我的词库 My Vocab Only"
              className={"tingxie-switch" + (state.myVocabOnly ? " tingxie-switch-on" : "")}
              onClick={() => dispatch({ type: "TOGGLE_MY_VOCAB_ONLY" })}
            >
              <span className="tingxie-switch-knob" />
            </button>
          </div>

          <div className="lesson-grid">
            {state.lessonIndex.map((entry) => (
              <button
                key={entry.id}
                className={"lesson-btn" + (state.pickerSelectedIds.includes(entry.id) ? " lesson-btn-active" : "")}
                onClick={() => dispatch({ type: "TOGGLE_PICKER_LESSON", id: entry.id })}
              >
                <div className="lesson-btn-num">{`第 ${entry.id} 课`}</div>
              </button>
            ))}
          </div>

          <div className="action-row">
            <button
              className="primary-btn"
              disabled={state.pickerSelectedIds.length === 0 || state.loadingReview || state.loadingLesson}
              onClick={startPractice}
            >
              {state.loadingReview || state.loadingLesson ? "加载中... Loading..." : "开始练习 Start Practice"}
            </button>
          </div>
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
