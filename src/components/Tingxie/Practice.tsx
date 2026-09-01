import { useEffect, useRef, useState } from "react";
import { usePet } from "../../state/PetContext";
import { TINGXIE_BP_PER_UNIT } from "../../data/pet";
import { buildTingxiePracticeVocabQueue, tingxieIconEmoji } from "../../data/tingxie";
import { speakText } from "../../lib/speech";
import { Sound } from "../../lib/sound";
import { recordTingxieActivityCompleted } from "../../state/tingxieProgress";
import { recordLessonCompleted } from "../../state/lessonFrequency";
import { checkAndAwardMissionBonus, logAchievement } from "../../state/achievements";
import { recordTingxieWrong } from "../../state/todaySummary";
import { loadHistory } from "../../state/history";
import { isWordSaved, addToMyVocab, removeFromMyVocab } from "../../state/myVocab";
import { useSwipe } from "../../lib/useSwipe";
import { useTingxieState, useTingxieDispatch } from "./tingxieState";
import { TingxieFlipCard } from "./TingxieFlipCard";
import { CompleteScreen } from "../common/CompleteScreen";

export function Practice() {
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const { awardBP } = usePet();
  // Guards the completion BP award (fires once, after BOTH phases finish) to
  // at most once per mount -- resets each time the student re-enters Practice.
  const awardedRef = useRef(false);
  const hasVocab = state.activeContent!.vocab.length > 0;
  // Both phases' unit counts, so the award covers the whole test (vocab +
  // sentence phases) regardless of which phase just finished.
  const bpAmount = Math.round(
    (TINGXIE_BP_PER_UNIT.PRACTICE_VOCAB * state.activeContent!.vocab.length +
      TINGXIE_BP_PER_UNIT.PRACTICE_SENTENCE * state.activeContent!.sentences.length) *
      (state.activeContent?.reducedBP ? 0.5 : 1)
  );

  useEffect(() => {
    dispatch({ type: "PRACTICE_START", queue: buildTingxiePracticeVocabQueue(state.activeContent!.vocab) });
    // Runs once on mount -- the reducer itself swaps in the sentence-phase
    // queue once the vocab-phase queue empties, so no second dispatch needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.practiceComplete && hasVocab && !awardedRef.current) {
      awardedRef.current = true;
      awardBP(bpAmount);
      Sound.applause();
      logAchievement({ type: "tingxieCompleted", detail: `${state.activeContent!.title}|test` });
      if (state.activeContent!.lessonId != null) recordLessonCompleted(state.activeContent!.lessonId);
      // My Vocab Only / Select Vocab sessions still earn BP, but don't count
      // towards Today's Mission/quests -- see TingxieActiveContent.vocabFilterMode.
      if (state.activeContent!.vocabFilterMode === "all") {
        recordTingxieActivityCompleted();
        checkAndAwardMissionBonus(loadHistory(), awardBP);
      }
    }
  }, [state.practiceComplete, hasVocab, awardBP, state.activeContent, bpAmount]);

  const current = state.practiceQueue[0];
  // Forces a re-render after toggling My Vocab -- isWordSaved() below reads
  // localStorage directly (no subscription), so nothing else would notice
  // the change.
  const [, forceVocabTick] = useState(0);
  function toggleMyVocab() {
    if (current?.kind !== "vocab") return;
    const item = current.item;
    if (isWordSaved(item.word)) removeFromMyVocab(item.word);
    else {
      addToMyVocab({
        word: item.word,
        pinyin: item.pinyin,
        meaning: item.meaning,
        example: item.example,
        lessonId: state.activeContent!.lessonId ?? null,
        lessonTitle: state.activeContent!.title
      });
      Sound.ding();
    }
    forceVocabTick((n) => n + 1);
  }

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

  // Swipe left/right mirror the Missed it/Got it edge buttons below (cross
  // on the left, tick on the right) -- only meaningful once the answer is
  // showing, same as those buttons.
  const swipe = useSwipe(
    () => {
      if (state.practiceFlipped) missed();
    },
    () => {
      if (state.practiceFlipped) correct();
    }
  );

  if (!hasVocab) {
    return <p className="tingxie-empty">这一课没有可用的听写测试。No test content available for this lesson.</p>;
  }

  if (state.practiceQueue.length === 0 && !state.practiceComplete) {
    return <p className="tingxie-loading">准备测试中... Preparing...</p>;
  }

  if (state.practiceComplete) {
    return <CompleteScreen title="听写测试完成！Test Complete!" bpAmount={bpAmount} />;
  }

  if (!current) return null;

  const phaseLabel = state.practicePhase === "tingxie" ? "第一阶段：听写词语 Phase 1: Vocab" : "第二阶段：听写句子 Phase 2: Sentences";

  const onToggleFlip = () => {
    if (swipe.guardClick()) return;
    dispatch({ type: "PRACTICE_FLIP" });
  };

  const flipCard =
    current.kind === "vocab" ? (
      <TingxieFlipCard
        flipped={state.practiceFlipped}
        onToggle={onToggleFlip}
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
        onToggle={onToggleFlip}
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
    );

  return (
    <div className="tingxie-carousel" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      <div className="tingxie-progress">
        {phaseLabel} · 剩余 {state.practiceQueue.length} 题 remaining
      </div>

      <div className="tingxie-flip-stage">
        {state.practiceFlipped && (
          <button
            type="button"
            className="tingxie-flip-edge-btn tingxie-flip-edge-btn-left tingxie-flip-edge-btn-wrong"
            aria-label="记错了 Missed it"
            onClick={missed}
          >
            ✕
          </button>
        )}

        {flipCard}

        {state.practiceFlipped && (
          <button
            type="button"
            className="tingxie-flip-edge-btn tingxie-flip-edge-btn-right tingxie-flip-edge-btn-correct"
            aria-label="记住了 Got it"
            onClick={correct}
          >
            ✓
          </button>
        )}
      </div>

      {!state.practiceFlipped && <p className="tingxie-flip-hint">点击卡片查看答案 Tap the card to see the answer</p>}

      {current.kind === "vocab" && (
        <button
          type="button"
          className={"tingxie-add-vocab-btn" + (isWordSaved(current.item.word) ? " tingxie-add-vocab-btn-saved" : "")}
          onClick={toggleMyVocab}
        >
          <span className="tingxie-add-vocab-plus">{isWordSaved(current.item.word) ? "✓" : "+"}</span>
          {isWordSaved(current.item.word) ? "已加入我的词库 Saved" : "加入我的词库 Add to My Vocab"}
        </button>
      )}
    </div>
  );
}
