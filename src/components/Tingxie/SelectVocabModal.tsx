import { useEffect, useState } from "react";
import type { TingxieLesson } from "../../data/types";
import { fetchTingxieLesson } from "../../data/tingxie";
import { shuffle } from "../../lib/shuffle";
import { Icon } from "../common/Icons";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";

// Sizes offered by the "Random N" shortcut -- draws from every vocab word
// across all lessons currently selected in LessonSelect's picker, capped to
// however many actually exist if fewer than the requested size.
const RANDOM_SAMPLE_SIZES = [5, 10] as const;

interface SelectVocabModalProps {
  // The lessons currently selected in LessonSelect's picker -- fetched here
  // (already warmed by prefetchTingxieLessons(), so this resolves from cache
  // near-instantly) rather than passed down, since this is the only place
  // that needs each lesson's full vocab/sentence lists.
  lessonIds: number[];
  onClose: () => void;
}

export function SelectVocabModal({ lessonIds, onClose }: SelectVocabModalProps) {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const [lessons, setLessons] = useState<Record<number, TingxieLesson> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLessons(null);
    setError(null);
    Promise.all(lessonIds.map((id) => fetchTingxieLesson(id).then((lesson) => [id, lesson] as const)))
      .then((pairs) => {
        if (cancelled) return;
        setLessons(Object.fromEntries(pairs));
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonIds]);

  function pickRandom(n: number) {
    if (!lessons) return;
    const allWords = lessonIds.flatMap((id) => lessons[id].vocab.map((v) => v.word));
    dispatch({ type: "SET_RANDOM_SELECTED_VOCAB_WORDS", words: shuffle(allWords).slice(0, n) });
  }

  const selectedCount = state.selectedVocabWords.size + state.selectedVocabSentences.size;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="vocab-picker-box">
        <div className="vocab-picker-header">
          <h2 className="vocab-picker-title">选择词语</h2>
          <button type="button" className="vocab-picker-close" aria-label="关闭" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="vocab-picker-random-row">
          {RANDOM_SAMPLE_SIZES.map((n) => (
            <button key={n} type="button" className="secondary-btn" disabled={!lessons} onClick={() => pickRandom(n)}>
              随机 {n} 个
            </button>
          ))}
        </div>

        <div className="vocab-picker-body">
          {error && <p className="tingxie-error-inline">{error}</p>}
          {!lessons && !error && <p className="tingxie-loading">加载中...</p>}
          {lessons &&
            lessonIds.map((id) => {
              const lesson = lessons[id];
              const lessonTitle = state.lessonIndex?.find((e) => e.id === id)?.title ?? `第 ${id} 课`;
              return (
                <div key={id} className="vocab-picker-lesson-group">
                  {lessonIds.length > 1 && <h3 className="vocab-picker-lesson-title">{lessonTitle}</h3>}
                  <div className="vocab-picker-word-grid">
                    {lesson.vocab.map((v) => (
                      <label key={v.word} className="vocab-picker-item">
                        <input
                          type="checkbox"
                          checked={state.selectedVocabWords.has(v.word)}
                          onChange={() => dispatch({ type: "TOGGLE_SELECTED_VOCAB_WORD", word: v.word })}
                        />
                        {v.word}
                      </label>
                    ))}
                  </div>
                  {lesson.sentences.length > 0 && (
                    <>
                      <h4 className="vocab-picker-sentence-heading">句子</h4>
                      <div className="vocab-picker-sentence-list">
                        {lesson.sentences.map((s) => (
                          <label key={s.text} className="vocab-picker-item vocab-picker-sentence-item">
                            <input
                              type="checkbox"
                              checked={state.selectedVocabSentences.has(s.text)}
                              onChange={() => dispatch({ type: "TOGGLE_SELECTED_VOCAB_SENTENCE", text: s.text })}
                            />
                            {s.text}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>

        <div className="vocab-picker-footer">
          <span className="vocab-picker-count">已选 {selectedCount} 项</span>
          <button type="button" className="primary-btn" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
