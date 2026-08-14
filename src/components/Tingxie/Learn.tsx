import { useEffect, useRef } from "react";
import { usePet } from "../../state/PetContext";
import { TINGXIE_BP_AWARD } from "../../data/pet";
import { tingxieIconEmoji, tingxieSentenceWords } from "../../data/tingxie";
import { speakText, speakWordThenSentence, stopSpeaking } from "../../lib/speech";
import { Sound } from "../../lib/sound";
import { recordTingxieActivityCompleted } from "../../state/tingxieProgress";
import { checkAndAwardMissionBonus, logAchievement } from "../../state/achievements";
import { loadHistory } from "../../state/history";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";
import { TingxieFlipCard } from "./TingxieFlipCard";
import { CompleteScreen } from "../common/CompleteScreen";

function VocabFlipCard() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const { awardBP } = usePet();
  // Guards the "flip every card once" BP award to fire at most once per
  // mount (i.e. once per lesson visit) -- Learn remounts fresh each time the
  // student navigates back into it, so replaying the lesson re-earns BP,
  // matching the source app's behavior.
  const awardedRef = useRef(false);

  const vocab = state.activeContent!.vocab;
  const current = vocab[state.vocabIndex];
  const allFlipped = vocab.length > 0 && state.vocabFlippedIndices.length === vocab.length;

  // Stop any in-progress dictation read-aloud whenever the student moves on
  // (flips back, moves to the next/prev card) so a reading never bleeds into
  // a card the student has already left.
  useEffect(() => {
    stopSpeaking();
  }, [state.vocabIndex, state.vocabFlipped]);

  useEffect(() => {
    if (allFlipped && !awardedRef.current) {
      awardedRef.current = true;
      awardBP(TINGXIE_BP_AWARD.VOCAB_LEARN);
      Sound.applause();
      recordTingxieActivityCompleted();
      logAchievement({ type: "tingxieCompleted", detail: `${state.activeContent!.title}|learnVocab` });
      checkAndAwardMissionBonus(loadHistory(), awardBP);
    }
  }, [allFlipped, awardBP, state.activeContent]);

  if (!current) return <p className="tingxie-empty">这一课还没有生词。No vocab in this lesson yet.</p>;

  // Wait for the card to be flipped back to its front (Next/Prev both do
  // this) before swapping to the complete screen -- otherwise flipping the
  // very last card would yank its answer away before the student can read
  // it, since allFlipped goes true the instant that flip happens.
  if (allFlipped && !state.vocabFlipped) {
    return <CompleteScreen title="全部生词已学习！All vocab reviewed!" bpAmount={TINGXIE_BP_AWARD.VOCAB_LEARN} />;
  }

  return (
    <div className="tingxie-carousel">
      <div className="tingxie-progress">
        {state.vocabIndex + 1} / {vocab.length}
      </div>

      <TingxieFlipCard
        flipped={state.vocabFlipped}
        onToggle={() => dispatch({ type: "VOCAB_FLIP" })}
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
  const awardedRef = useRef(false);

  const sentences = state.activeContent!.sentences;
  const current = sentences[state.sentenceIndex];
  const allSolved = sentences.length > 0 && state.sentenceSolvedIndices.length === sentences.length;

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

  useEffect(() => {
    if (allSolved && !awardedRef.current) {
      awardedRef.current = true;
      awardBP(TINGXIE_BP_AWARD.SENTENCE_LEARN);
      Sound.applause();
      recordTingxieActivityCompleted();
      logAchievement({ type: "tingxieCompleted", detail: `${state.activeContent!.title}|learnSentence` });
      checkAndAwardMissionBonus(loadHistory(), awardBP);
    }
  }, [allSolved, awardBP, state.activeContent]);

  if (!current) return <p className="tingxie-empty">这一课还没有句子。No sentences in this lesson yet.</p>;

  // Wait for the result banner to clear (Next/Prev/Reset all reset it) before
  // swapping to the complete screen -- otherwise solving the very last
  // sentence would yank its "Correct!"/reveal feedback away immediately,
  // since allSolved goes true the instant that answer is checked.
  if (allSolved && state.sentenceResult === null) {
    return <CompleteScreen title="全部句子已完成！All sentences solved!" bpAmount={TINGXIE_BP_AWARD.SENTENCE_LEARN} />;
  }

  const words = tingxieSentenceWords(current);
  const bag = state.chipOrder.filter((i) => !state.placedIndices.includes(i));
  const trayClass = "tingxie-tray" + (state.sentenceResult === "correct" ? " result-correct" : state.sentenceResult === "incorrect" ? " result-incorrect" : "");

  return (
    <div className="tingxie-sentence-game">
      <div className="tingxie-progress">
        {state.sentenceIndex + 1} / {sentences.length}
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
