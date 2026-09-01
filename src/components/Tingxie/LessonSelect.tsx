import { useEffect, useState } from "react";
import type { TingxieSentence, TingxieVocabItem } from "../../data/types";
import { fetchTingxieLessonIndex, fetchTingxieLesson, prefetchTingxieLessons, pooledTingxieReview } from "../../data/tingxie";
import { isTingxieMissionComplete } from "../../lib/stats";
import { shouldNudgeForLesson } from "../../state/lessonFrequency";
import { loadMyVocab } from "../../state/myVocab";
import { ConfirmModal } from "../common/Modal";
import { Icon } from "../common/Icons";
import { useTingxieState, useTingxieDispatch, type TingxieVocabFilterMode } from "./tingxieState";
import { SelectVocabModal } from "./SelectVocabModal";

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

// Narrows a vocab/sentence list down to exactly what the student checked in
// the Select Vocab popup (matched by word/sentence text -- see
// TingxieState.selectedVocabWords/selectedVocabSentences's own comment for
// why text is a safe-enough key here).
function filterToSelection(
  vocab: TingxieVocabItem[],
  sentences: TingxieSentence[],
  selectedWords: Set<string>,
  selectedSentences: Set<string>
): { vocab: TingxieVocabItem[]; sentences: TingxieSentence[] } {
  return {
    vocab: vocab.filter((v) => selectedWords.has(v.word)),
    sentences: sentences.filter((s) => selectedSentences.has(s.text))
  };
}

// LessonSelect's vocab-scope radio group -- "selected" is additionally
// gated on having at least one lesson picked (see its `disabled` prop below,
// since the popup needs to know which lesson(s)' vocab to show).
const VOCAB_FILTER_OPTIONS: { mode: TingxieVocabFilterMode; label: string }[] = [
  { mode: "all", label: "全部词语" },
  { mode: "myVocabOnly", label: "我的词库" },
  { mode: "selected", label: "自选词语" }
];

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
  // Whether the Select Vocab popup (SelectVocabModal) is open -- not part of
  // the shared reducer since it's purely this screen's own transient UI
  // state, same reasoning as Tingxie.tsx's sidebarOpen.
  const [showVocabPicker, setShowVocabPicker] = useState(false);
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
    const mode = state.vocabFilterMode;
    fetchTingxieLesson(id)
      .then((lesson) => {
        let vocab = lesson.vocab;
        let sentences = lesson.sentences;
        if (mode === "myVocabOnly") {
          vocab = filterToMyVocab(vocab);
          sentences = [];
        } else if (mode === "selected") {
          ({ vocab, sentences } = filterToSelection(vocab, sentences, state.selectedVocabWords, state.selectedVocabSentences));
        }
        dispatch({
          type: "SELECT_LESSON_SUCCESS",
          content: {
            title: title || lesson.title,
            vocab,
            sentences,
            applyVocab: vocab,
            isCustomReview: false,
            lessonId: id,
            reducedBP,
            vocabFilterMode: mode
          }
        });
      })
      .catch((err: Error) => dispatch({ type: "SELECT_LESSON_ERROR", error: err.message }));
  }

  function startCustomReview(ids: number[]) {
    dispatch({ type: "CUSTOM_REVIEW_START" });
    const mode = state.vocabFilterMode;
    Promise.all(ids.map((id) => fetchTingxieLesson(id)))
      .then((lessons) => {
        let vocab: TingxieVocabItem[];
        let sentences: TingxieSentence[];
        let applyVocab: TingxieVocabItem[];
        if (mode === "selected") {
          // Filters the full (uncapped) pool across every selected lesson,
          // not pooledTingxieReview()'s random 20-word/5-sentence sample --
          // Select Vocab's whole point is precise curation, so every
          // hand-picked word/sentence must survive regardless of whether it
          // happened to land in that sample.
          const allVocab = lessons.flatMap((l) => l.vocab);
          const allSentences = lessons.flatMap((l) => l.sentences);
          ({ vocab, sentences } = filterToSelection(allVocab, allSentences, state.selectedVocabWords, state.selectedVocabSentences));
          applyVocab = vocab;
        } else {
          const pooled = pooledTingxieReview(lessons);
          vocab = mode === "myVocabOnly" ? filterToMyVocab(pooled.vocab) : pooled.vocab;
          sentences = mode === "myVocabOnly" ? [] : pooled.sentences;
          applyVocab = mode === "myVocabOnly" ? filterToMyVocab(pooled.applyVocab) : pooled.applyVocab;
        }
        dispatch({
          type: "CUSTOM_REVIEW_SUCCESS",
          target: "apply",
          content: {
            title: "自由复习 Custom Review",
            vocab,
            sentences,
            applyVocab,
            isCustomReview: true,
            vocabFilterMode: mode
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

          <div className="tingxie-vocab-scope-row">
            <span className="tingxie-difficulty-label">词语范围</span>
            <div className="tingxie-vocab-scope-options">
              {VOCAB_FILTER_OPTIONS.map(({ mode, label }) => {
                const disabled = mode === "selected" && state.pickerSelectedIds.length === 0;
                return (
                  <label key={mode} className={"tingxie-vocab-scope-option" + (disabled ? " tingxie-vocab-scope-option-disabled" : "")}>
                    <input
                      type="radio"
                      name="tingxie-vocab-scope"
                      disabled={disabled}
                      checked={state.vocabFilterMode === mode}
                      onChange={() => {
                        dispatch({ type: "SET_VOCAB_FILTER_MODE", mode });
                        if (mode === "selected") setShowVocabPicker(true);
                      }}
                    />
                    {label}
                  </label>
                );
              })}
            </div>
            {state.vocabFilterMode === "selected" && state.pickerSelectedIds.length > 0 && (
              <button type="button" className="secondary-btn tingxie-vocab-scope-edit-btn" onClick={() => setShowVocabPicker(true)}>
                编辑已选（{state.selectedVocabWords.size + state.selectedVocabSentences.size}）
              </button>
            )}
          </div>

          <div className="action-row">
            <button
              className="primary-btn"
              disabled={
                state.pickerSelectedIds.length === 0 ||
                state.loadingReview ||
                state.loadingLesson ||
                (state.vocabFilterMode === "selected" && state.selectedVocabWords.size === 0 && state.selectedVocabSentences.size === 0)
              }
              onClick={startPractice}
            >
              {state.loadingReview || state.loadingLesson ? "加载中... Loading..." : "开始练习"}
            </button>
          </div>
        </>
      )}

      {showVocabPicker && <SelectVocabModal lessonIds={state.pickerSelectedIds} onClose={() => setShowVocabPicker(false)} />}

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
