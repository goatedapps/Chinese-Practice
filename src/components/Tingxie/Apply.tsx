import { useEffect, useRef } from "react";
import { usePet } from "../../state/PetContext";
import { TINGXIE_BP_PER_UNIT } from "../../data/pet";
import { buildTingxieApplyQueue } from "../../data/tingxie";
import { speakText, stopSpeaking } from "../../lib/speech";
import { Sound } from "../../lib/sound";
import { recordTingxieActivityCompleted } from "../../state/tingxieProgress";
import { checkAndAwardMissionBonus, logAchievement } from "../../state/achievements";
import { recordTingxieWrong } from "../../state/todaySummary";
import { loadHistory } from "../../state/history";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";
import { TingxieFlipCard } from "./TingxieFlipCard";
import { CompleteScreen } from "../common/CompleteScreen";

export function Apply() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const { awardBP } = usePet();
  // Guards the completion BP award to fire at most once per mount (i.e. once
  // per Apply visit) -- this component remounts fresh each time the student
  // navigates back into the Apply tab, so redoing it re-earns BP.
  const awardedRef = useRef(false);
  // Same filter buildTingxieApplyQueue() uses to decide which words get a
  // queue item, so this word count always matches the queue's real length.
  const wordCount = state.activeContent!.applyVocab.filter((v) => v.sentenceBank && v.sentenceBank.length > 0).length;
  const hasBankEntries = wordCount > 0;
  const bpAmount = TINGXIE_BP_PER_UNIT.APPLY * wordCount;

  useEffect(() => {
    dispatch({ type: "APPLY_START", queue: buildTingxieApplyQueue(state.activeContent!.applyVocab) });
    // Runs once on mount -- builds a fresh randomized queue each visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.applyComplete && hasBankEntries && !awardedRef.current) {
      awardedRef.current = true;
      awardBP(bpAmount);
      Sound.applause();
      recordTingxieActivityCompleted();
      logAchievement({ type: "tingxieCompleted", detail: `${state.activeContent!.title}|apply` });
      checkAndAwardMissionBonus(loadHistory(), awardBP);
    }
  }, [state.applyComplete, hasBankEntries, awardBP, state.activeContent, bpAmount]);

  const current = state.applyQueue[0];

  // Stop any in-progress dictation read-aloud the moment the card is flipped
  // -- otherwise a reading started via the front's 🔊 button keeps playing
  // after the student has already moved on to the answer.
  useEffect(() => {
    if (state.applyFlipped) stopSpeaking();
  }, [state.applyFlipped]);

  function correct() {
    Sound.ding();
    dispatch({ type: "APPLY_CORRECT" });
  }

  function missed() {
    Sound.miss();
    recordTingxieWrong({
      activity: "apply",
      kind: "vocab",
      lessonTitle: state.activeContent!.title,
      prompt: current.blanked,
      answer: current.word
    });
    dispatch({ type: "APPLY_MISSED" });
  }

  if (!hasBankEntries) {
    return <p className="tingxie-empty">这一课没有可用的词语应用练习。No apply exercises available for this lesson.</p>;
  }

  if (state.applyQueue.length === 0 && !state.applyComplete) {
    return <p className="tingxie-loading">准备练习中... Preparing...</p>;
  }

  if (state.applyComplete) {
    return <CompleteScreen title="词语应用完成！Apply Practice Complete!" bpAmount={bpAmount} />;
  }

  if (!current) return null;

  return (
    <div className="tingxie-carousel">
      <div className="tingxie-progress">剩余 {state.applyQueue.length} 题 remaining</div>

      <TingxieFlipCard
        flipped={state.applyFlipped}
        onToggle={() => dispatch({ type: "APPLY_FLIP" })}
        front={
          <div className="tingxie-apply-front">
            <div className="tingxie-apply-sentence">{current.blanked}</div>
            <div className="tingxie-apply-english">{current.english}</div>
            <button
              type="button"
              className="secondary-btn tingxie-speak-btn"
              onClick={(e) => {
                e.stopPropagation();
                speakText(current.fullSentence);
              }}
            >
              🔊 朗读 Listen
            </button>
          </div>
        }
        back={<div className="tingxie-apply-answer">{current.answer}</div>}
      />

      {state.applyFlipped ? (
        <div className="self-check-row tingxie-self-check">
          <button className="self-btn self-right" onClick={correct}>
            ✓ 答对了 Correct
          </button>
          <button className="self-btn self-wrong" onClick={missed}>
            ✗ 答错了 Wrong
          </button>
        </div>
      ) : (
        <p className="tingxie-flip-hint">点击卡片查看答案 Tap the card to see the answer</p>
      )}
    </div>
  );
}
