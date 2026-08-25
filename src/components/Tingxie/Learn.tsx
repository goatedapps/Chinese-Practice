import { useEffect, useRef } from "react";
import { usePet } from "../../state/PetContext";
import { TINGXIE_BP_PER_UNIT } from "../../data/pet";
import { tingxieIconEmoji, tingxieSentenceWords, tingxieSentenceChars } from "../../data/tingxie";
import { speakText, speakWordThenSentence, stopSpeaking } from "../../lib/speech";
import { Sound } from "../../lib/sound";
import { recordTingxieActivityCompleted } from "../../state/tingxieProgress";
import { checkAndAwardMissionBonus, logAchievement } from "../../state/achievements";
import { loadHistory } from "../../state/history";
import { useSwipe } from "../../lib/useSwipe";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";
import { TingxieFlipCard } from "./TingxieFlipCard";
import { CompleteScreen } from "../common/CompleteScreen";

function VocabFlipCard() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const { awardBP } = usePet();
  // Extra same-mount guard for React 18 StrictMode's dev-only double effect
  // invocation -- state.vocabLearnAwarded (reducer state, see tingxieState.tsx)
  // is the real guard, since it survives the unmount/remount that switching
  // Tingxie's tabs causes (a plain ref would reset to false on that remount
  // and re-fire the award instantly without the student redoing anything).
  // Leaving/re-entering the lesson for real (GO_SELECT/SELECT_LESSON_SUCCESS)
  // resets vocabLearnAwarded too, so replaying the lesson still re-earns BP.
  const awardedRef = useRef(false);

  const vocab = state.activeContent!.vocab;
  const current = vocab[state.vocabIndex];
  const allFlipped = vocab.length > 0 && state.vocabFlippedIndices.length === vocab.length;
  const bpAmount = TINGXIE_BP_PER_UNIT.VOCAB_LEARN * vocab.length;

  // Swipe left/right mirror the Prev/Next buttons below.
  const swipe = useSwipe(
    () => dispatch({ type: "VOCAB_NEXT" }),
    () => dispatch({ type: "VOCAB_PREV" })
  );

  // Stop any in-progress dictation read-aloud whenever the student moves on
  // (flips back, moves to the next/prev card) so a reading never bleeds into
  // a card the student has already left.
  useEffect(() => {
    stopSpeaking();
  }, [state.vocabIndex, state.vocabFlipped]);

  // Gated on the same condition that swaps in CompleteScreen below (not just
  // allFlipped, which goes true a render earlier, while the last card is
  // still flipped) so the applause sound never plays before that screen
  // actually appears.
  useEffect(() => {
    if (allFlipped && !state.vocabFlipped && !state.vocabLearnAwarded && !awardedRef.current) {
      awardedRef.current = true;
      dispatch({ type: "VOCAB_LEARN_AWARDED" });
      awardBP(bpAmount);
      Sound.applause();
      recordTingxieActivityCompleted();
      logAchievement({ type: "tingxieCompleted", detail: `${state.activeContent!.title}|learnVocab` });
      checkAndAwardMissionBonus(loadHistory(), awardBP);
    }
  }, [allFlipped, state.vocabFlipped, state.vocabLearnAwarded, awardBP, state.activeContent, dispatch, bpAmount]);

  if (!current) return <p className="tingxie-empty">这一课还没有生词。No vocab in this lesson yet.</p>;

  // Wait for the card to be flipped back to its front (Next/Prev both do
  // this) before swapping to the complete screen -- otherwise flipping the
  // very last card would yank its answer away before the student can read
  // it, since allFlipped goes true the instant that flip happens.
  if (allFlipped && !state.vocabFlipped) {
    return <CompleteScreen title="全部生词已学习！All vocab reviewed!" bpAmount={bpAmount} />;
  }

  return (
    <div className="tingxie-carousel" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      <div className="tingxie-progress">
        {state.vocabIndex + 1} / {vocab.length}
      </div>

      <TingxieFlipCard
        flipped={state.vocabFlipped}
        onToggle={() => {
          if (swipe.guardClick()) return;
          dispatch({ type: "VOCAB_FLIP" });
        }}
        front={<div className="tingxie-vocab-word">{current.word}</div>}
        back={
          <div className="tingxie-vocab-back">
            <div className="tingxie-vocab-pinyin">{current.pinyin}</div>
            <div className="tingxie-vocab-meaning">{current.meaning}</div>
            <div className="tingxie-vocab-example">{current.example}</div>
            <button
              type="button"
              className="secondary-btn tingxie-speak-btn"
              onClick={(e) => {
                e.stopPropagation();
                speakWordThenSentence(current.word, current.example);
              }}
            >
              🔊 朗读 Listen
            </button>
          </div>
        }
      />

      <div className="tingxie-nav-row">
        <button className="secondary-btn" onClick={() => dispatch({ type: "VOCAB_PREV" })}>
          ← 上一个 Prev
        </button>
        <button className="secondary-btn" onClick={() => dispatch({ type: "VOCAB_NEXT" })}>
          下一个 Next →
        </button>
      </div>
    </div>
  );
}

function SentenceBuilderGame() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const { awardBP } = usePet();
  // Same StrictMode-only same-mount guard as VocabFlipCard above --
  // state.sentenceLearnAwarded is the real cross-remount guard.
  const awardedRef = useRef(false);

  const sentences = state.activeContent!.sentences;
  const current = sentences[state.sentenceIndex];
  const allSolved = sentences.length > 0 && state.sentenceSolvedIndices.length === sentences.length;
  const bpAmount = TINGXIE_BP_PER_UNIT.SENTENCE_LEARN * sentences.length;

  useEffect(() => {
    if (state.sentenceResult === "correct") Sound.ding();
    else if (state.sentenceResult === "incorrect") Sound.miss();
  }, [state.sentenceResult]);

  // Stop any in-progress dictation read-aloud whenever the student moves on
  // (next/prev sentence, reset, reveal) so a reading never bleeds into a
  // sentence the student has already left.
  useEffect(() => {
    stopSpeaking();
  }, [state.sentenceIndex, state.sentenceResult, state.sentenceRevealed]);

  // Gated on the same condition that swaps in CompleteScreen below (not just
  // allSolved, which goes true a render earlier, while the last result
  // banner is still showing) so the applause sound never plays before that
  // screen actually appears.
  useEffect(() => {
    if (allSolved && state.sentenceResult === null && !state.sentenceLearnAwarded && !awardedRef.current) {
      awardedRef.current = true;
      dispatch({ type: "SENTENCE_LEARN_AWARDED" });
      awardBP(bpAmount);
      Sound.applause();
      recordTingxieActivityCompleted();
      logAchievement({ type: "tingxieCompleted", detail: `${state.activeContent!.title}|learnSentence` });
      checkAndAwardMissionBonus(loadHistory(), awardBP);
    }
  }, [allSolved, state.sentenceResult, state.sentenceLearnAwarded, awardBP, state.activeContent, dispatch, bpAmount]);

  if (!current) return <p className="tingxie-empty">这一课还没有句子。No sentences in this lesson yet.</p>;

  // Wait for the result banner to clear (Next/Prev/Reset all reset it) before
  // swapping to the complete screen -- otherwise solving the very last
  // sentence would yank its "Correct!"/reveal feedback away immediately,
  // since allSolved goes true the instant that answer is checked.
  if (allSolved && state.sentenceResult === null) {
    return <CompleteScreen title="全部句子已完成！All sentences solved!" bpAmount={bpAmount} />;
  }

  const words = state.sentenceDifficulty === "hard" ? tingxieSentenceChars(current) : tingxieSentenceWords(current);
  const bag = state.chipOrder.filter((i) => !state.placedIndices.includes(i));
  const trayClass = "tingxie-tray" + (state.sentenceResult === "correct" ? " result-correct" : state.sentenceResult === "incorrect" ? " result-incorrect" : "");

  return (
    <div className="tingxie-sentence-game">
      <div className="tingxie-progress">
        {state.sentenceIndex + 1} / {sentences.length}
      </div>

      <div className="tingxie-difficulty-toggle">
        <span className={"tingxie-difficulty-label" + (state.sentenceDifficulty === "easy" ? " tingxie-difficulty-label-active" : "")}>
          容易 Easy
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={state.sentenceDifficulty === "hard"}
          aria-label="切换难度 Toggle difficulty"
          className={"tingxie-switch" + (state.sentenceDifficulty === "hard" ? " tingxie-switch-on" : "")}
          onClick={() =>
            dispatch({ type: "SET_SENTENCE_DIFFICULTY", difficulty: state.sentenceDifficulty === "easy" ? "hard" : "easy" })
          }
        >
          <span className="tingxie-switch-knob" />
        </button>
        <span className={"tingxie-difficulty-label" + (state.sentenceDifficulty === "hard" ? " tingxie-difficulty-label-active" : "")}>
          困难 Hard
        </span>
      </div>

      <div className="tingxie-scenario">
        <span className="tingxie-scenario-icon">{tingxieIconEmoji(current.icon)}</span>
        <span className="tingxie-scenario-desc">{current.description}</span>
      </div>

      <div className={trayClass}>
        {state.placedIndices.length === 0 && <span className="tingxie-tray-hint">点击下方词语，按顺序拼出句子 Tap the words below in order</span>}
        {state.placedIndices.map((i) => (
          <button
            key={i}
            type="button"
            className="tingxie-tray-chip"
            disabled={state.sentenceResult === "correct"}
            onClick={() => dispatch({ type: "SENTENCE_UNPICK", idx: i })}
          >
            {words[i]}
          </button>
        ))}
      </div>

      <div className="tingxie-chip-bag">
        {bag.map((i) => (
          <button key={i} className="tingxie-chip" onClick={() => dispatch({ type: "SENTENCE_PICK", idx: i })}>
            {words[i]}
          </button>
        ))}
      </div>

      {state.sentenceResult === "incorrect" && (
        <div className="tingxie-sentence-feedback tingxie-feedback-incorrect">
          <span>顺序不对，再试一次！Not quite -- try again.</span>
          {!state.sentenceRevealed ? (
            <button className="secondary-btn" onClick={() => dispatch({ type: "SENTENCE_REVEAL" })}>
              查看答案 Reveal answer
            </button>
          ) : (
            <div className="tingxie-full-sentence">
              {current.text}
              <button
                type="button"
                className="secondary-btn tingxie-speak-btn"
                onClick={() => speakText(current.text)}
              >
                🔊 朗读 Listen
              </button>
            </div>
          )}
        </div>
      )}

      {state.sentenceResult === "correct" && (
        <div className="tingxie-sentence-feedback tingxie-feedback-correct">
          <span>✓ 正确！Correct!</span>
          {!state.sentenceRevealed ? (
            <button className="secondary-btn" onClick={() => dispatch({ type: "SENTENCE_REVEAL" })}>
              查看完整句子 Show sentence
            </button>
          ) : (
            <div className="tingxie-full-sentence">
              {current.text}
              <button
                type="button"
                className="secondary-btn tingxie-speak-btn"
                onClick={() => speakText(current.text)}
              >
                🔊 朗读 Listen
              </button>
            </div>
          )}
        </div>
      )}

      <div className="tingxie-nav-row">
        <button className="secondary-btn" onClick={() => dispatch({ type: "SENTENCE_PREV" })}>
          ← 上一句 Prev
        </button>
        <button className="secondary-btn" onClick={() => dispatch({ type: "SENTENCE_RESET" })}>
          🔄 重来 Reset
        </button>
        <button className="secondary-btn" onClick={() => dispatch({ type: "SENTENCE_NEXT" })}>
          下一句 Next →
        </button>
      </div>
    </div>
  );
}

export function Learn() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();

  return (
    <div className="tingxie-learn">
      <div className="tingxie-subtabs">
        <button className={"tingxie-subtab" + (state.subTab === "vocab" ? " tingxie-subtab-active" : "")} onClick={() => dispatch({ type: "SET_SUB_TAB", tab: "vocab" })}>
          学词语 Vocab
        </button>
        <button className={"tingxie-subtab" + (state.subTab === "sentence" ? " tingxie-subtab-active" : "")} onClick={() => dispatch({ type: "SET_SUB_TAB", tab: "sentence" })}>
          学默写 Sentences
        </button>
      </div>

      {state.subTab === "vocab" ? <VocabFlipCard /> : <SentenceBuilderGame />}
    </div>
  );
}
