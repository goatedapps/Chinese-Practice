import { useEffect, useRef } from "react";
import { usePet } from "../../state/PetContext";
import { TINGXIE_BP_AWARD } from "../../data/pet";
import { buildTingxiePracticeVocabQueue, tingxieIconEmoji } from "../../data/tingxie";
import { speakText } from "../../lib/speech";
import { Sound } from "../../lib/sound";
import { recordTingxieActivityCompleted } from "../../state/tingxieProgress";
import { checkAndAwardMissionBonus } from "../../state/achievements";
import { recordTingxieWrong } from "../../state/todaySummary";
import { loadHistory } from "../../state/history";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";
import { TingxieFlipCard } from "./TingxieFlipCard";

export function Practice() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const { awardBP } = usePet();
  // Guards the completion BP award (fires once, after BOTH phases finish) to
  // at most once per mount -- resets each time the student re-enters Practice.
  const awardedRef = useRef(false);
  const hasVocab = state.activeContent!.vocab.length > 0;

  useEffect(() => {
    dispatch({ type: "PRACTICE_START", queue: buildTingxiePracticeVocabQueue(state.activeContent!.vocab) });
    // Runs once on mount -- the reducer itself swaps in the sentence-phase
    // queue once the vocab-phase queue empties, so no second dispatch needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.practiceComplete && hasVocab && !awardedRef.current) {
      awardedRef.current = true;
      awardBP(TINGXIE_BP_AWARD.PRACTICE);
      Sound.gift();
      recordTingxieActivityCompleted();
      checkAndAwardMissionBonus(loadHistory(), awardBP);
    }
  }, [state.practiceComplete, hasVocab, awardBP]);

  const current = state.practiceQueue[0];

  // Auto-speak the word when a new tingxie-phase (vocab) card appears --
  // not on click, matching the source app. The sentence phase (moxie) never
  // auto-speaks. current/practicePhase always change together (the reducer
  // resets practiceFlipped in the same transition), so this only ever fires
  // right when a fresh card is shown, never on a flip toggle.
  useEffect(() => {
    if (state.practicePhase === "tingxie" && current?.kind === "vocab") {
      speakText(current.item.word);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, state.practicePhase]);

  function correct() {
    Sound.ding();
    dispatch({ type: "PRACTICE_CORRECT" });
  }

  function missed() {
    Sound.miss();
    if (current?.kind === "vocab") {
      recordTingxieWrong({
        activity: "practice",
        kind: "vocab",
        lessonTitle: state.activeContent!.title,
        prompt: `${current.item.pinyin} · ${current.item.meaning}`,
        answer: current.item.word
      });
    } else if (current?.kind === "sentence") {
      recordTingxieWrong({
        activity: "practice",
        kind: "sentence",
        lessonTitle: state.activeContent!.title,
        prompt: current.item.description,
        answer: current.item.text
      });
    }
    dispatch({ type: "PRACTICE_MISSED" });
  }

  if (!hasVocab) {
    return <p className="tingxie-empty">这一课没有可用的听写练习。No practice content available for this lesson.</p>;
  }

  if (state.practiceQueue.length === 0 && !state.practiceComplete) {
    return <p className="tingxie-loading">准备练习中... Preparing...</p>;
  }

  if (state.practiceComplete) {
    return (
      <div className="tingxie-complete-screen">
        <div className="tingxie-complete-emoji">🎉</div>
        <h2>听写练习完成！Practice Complete!</h2>
        <p className="bp-pop">+{TINGXIE_BP_AWARD.PRACTICE} BP</p>
      </div>
    );
  }

  if (!current) return null;

  const phaseLabel = state.practicePhase === "tingxie" ? "第一阶段：听写词语 Phase 1: Vocab" : "第二阶段：听写句子 Phase 2: Sentences";

  return (
    <div className="tingxie-carousel">
      <div className="tingxie-progress">
        {phaseLabel} · 剩余 {state.practiceQueue.length} 题 remaining
      </div>

      {current.kind === "vocab" ? (
        <TingxieFlipCard
          flipped={state.practiceFlipped}
          onToggle={() => dispatch({ type: "PRACTICE_FLIP" })}
          front={
            <div className="tingxie-practice-front">
              <div className="tingxie-vocab-pinyin">{current.item.pinyin}</div>
              <div className="tingxie-vocab-meaning">{current.item.meaning}</div>
            </div>
          }
          back={<div className="tingxie-vocab-word">{current.item.word}</div>}
        />
      ) : (
        <TingxieFlipCard
          flipped={state.practiceFlipped}
          onToggle={() => dispatch({ type: "PRACTICE_FLIP" })}
          front={
            <div className="tingxie-scenario tingxie-scenario-card">
              <span className="tingxie-scenario-icon">{tingxieIconEmoji(current.item.icon)}</span>
              <span className="tingxie-scenario-desc">{current.item.description}</span>
              <button
                type="button"
                className="secondary-btn tingxie-speak-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(current.item.text);
                }}
              >
                🔊 朗读 Listen
              </button>
            </div>
          }
          back={
            <div className="tingxie-practice-sentence-back">
              {current.item.text}
              <button
                type="button"
                className="secondary-btn tingxie-speak-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(current.item.text);
                }}
              >
                🔊 朗读 Listen
              </button>
            </div>
          }
        />
      )}

      {state.practiceFlipped ? (
        <div className="self-check-row tingxie-self-check">
          <button className="self-btn self-right" onClick={correct}>
            ✓ 记住了 Got it
          </button>
          <button className="self-btn self-wrong" onClick={missed}>
            ✗ 记错了 Missed it
          </button>
        </div>
      ) : (
        <p className="tingxie-flip-hint">点击卡片查看答案 Tap the card to see the answer</p>
      )}
    </div>
  );
}
