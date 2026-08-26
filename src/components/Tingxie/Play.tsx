import { useEffect, useRef, useState } from "react";
import { usePet } from "../../state/PetContext";
import { TINGXIE_PLAY_CONFIG } from "../../data/pet";
import { buildTingxieApplyQueue, fetchAllTingxieVocabWords, type TingxieApplyItem } from "../../data/tingxie";
import { Sound } from "../../lib/sound";
import { recordTingxieActivityCompleted } from "../../state/tingxieProgress";
import { recordLessonCompleted } from "../../state/lessonFrequency";
import { checkAndAwardMissionBonus, logAchievement } from "../../state/achievements";
import { loadHistory } from "../../state/history";
import { tingxiePlayRoundsToday, recordTingxiePlayRound } from "../../state/tingxiePlayLimit";
import { useTingxieState } from "./tingxieState";
import { CompleteScreen } from "../common/CompleteScreen";

interface FallingCloud {
  id: number;
  word: string;
  x: number; // percent, left position
  fallSec: number;
}

function randomCloudX(): number {
  return 6 + Math.random() * 88;
}

function randomFallSec(): number {
  return TINGXIE_PLAY_CONFIG.MIN_FALL_SEC + Math.random() * (TINGXIE_PLAY_CONFIG.MAX_FALL_SEC - TINGXIE_PLAY_CONFIG.MIN_FALL_SEC);
}

// Dictation Practice's "Play" (词云游戏) minigame -- a timed round (see
// TINGXIE_PLAY_CONFIG.DURATION_SEC) where a blanked sentence (from the
// lesson's sentenceBank, same source Apply's
// blank-fill exercise uses -- see buildTingxieApplyQueue()) is shown, and
// word clouds keep falling until the student taps the one that fills the
// blank. A correct tap scores it and immediately swaps in the next blanked
// sentence; a wrong tap just costs BP and the same sentence stays up.
// Distractor clouds are drawn from *every* lesson's vocabulary, not just
// this one (fetchAllTingxieVocabWords()) -- unlike every other Tingxie
// activity, which stays scoped to the lesson/pooled-review selection.
//
// Deliberately no "🔊 Listen" button here (unlike Apply's front face) --
// reading the full sentence aloud would speak the missing word out loud,
// handing the student the answer.
//
// Fast-changing per-frame-ish state (falling clouds, the live score) is
// plain local state/refs, not the shared TingxieState reducer -- same
// reasoning as the toy minigames under components/Play/ staying outside
// AppStateContext. Cloud fall motion is a CSS keyframe animation per cloud
// (removed via onAnimationEnd for a miss, or immediately on tap for a hit),
// not a requestAnimationFrame/state position loop -- see CatchGame.tsx's
// comment for why a state-driven per-frame loop is the one thing to avoid
// here.
export function Play() {
  const state = useTingxieState();
  const { awardBP } = usePet();
  const hasBankEntries = state.activeContent!.applyVocab.some((v) => v.sentenceBank && v.sentenceBank.length > 0);
  const bpMultiplier = state.activeContent?.reducedBP ? 0.5 : 1;

  const [phase, setPhase] = useState<"loading" | "playing" | "complete">("loading");
  const [current, setCurrent] = useState<TingxieApplyItem | null>(null);
  const [clouds, setClouds] = useState<FallingCloud[]>([]);
  const [timeLeft, setTimeLeft] = useState(TINGXIE_PLAY_CONFIG.DURATION_SEC);
  const [finalScore, setFinalScore] = useState(0);
  const [feedback, setFeedback] = useState<{ delta: number; key: number } | null>(null);

  const currentRef = useRef<TingxieApplyItem | null>(null);
  const queueRef = useRef<TingxieApplyItem[]>([]);
  const wordPoolRef = useRef<string[]>([]);
  const scoreRef = useRef(0);
  const cloudIdRef = useRef(0);
  const finishedRef = useRef(false);
  // Timestamp the correct cloud most recently went missing from screen, or
  // null while one is currently falling -- lets the spawner guarantee an
  // eventual reappearance (CORRECT_MAX_ABSENCE_MS) without making every
  // reappearance happen at the same predictable delay.
  const correctMissingSinceRef = useRef<number | null>(null);
  // Locked in once, when the round starts (not re-checked at finish) --
  // whether today's rounds-played count is still under
  // TINGXIE_PLAY_CONFIG.DAILY_BP_ROUND_LIMIT. Determines both the
  // "practice mode" banner shown for the whole round and whether
  // finishRound() actually awards BP.
  const roundCanEarnBPRef = useRef(true);

  function advanceSentence() {
    if (queueRef.current.length === 0) {
      queueRef.current = buildTingxieApplyQueue(state.activeContent!.applyVocab);
    }
    const next = queueRef.current.shift() ?? null;
    currentRef.current = next;
    setCurrent(next);
  }

  // Loads the distractor word pool (every lesson's vocab, see the file
  // comment above) and the first sentence, then starts the round -- the
  // fetch usually resolves near-instantly since LessonSelect.tsx already
  // prefetches every lesson in the background, but this still waits on it
  // rather than starting the timer against a possibly-empty distractor pool.
  useEffect(() => {
    if (!hasBankEntries) return;
    let cancelled = false;
    fetchAllTingxieVocabWords()
      .then((words) => {
        if (cancelled) return;
        wordPoolRef.current = words;
      })
      .catch(() => {
        // A failed fetch just means distractor clouds fall back to reusing
        // whichever words the current sentence needs -- the round still works.
      })
      .finally(() => {
        if (cancelled) return;
        roundCanEarnBPRef.current = tingxiePlayRoundsToday() < TINGXIE_PLAY_CONFIG.DAILY_BP_ROUND_LIMIT;
        advanceSentence();
        setPhase("playing");
      });
    return () => {
      cancelled = true;
    };
    // Runs once on mount, same as Apply.tsx's queue-building effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBankEntries]);

  function finishRound() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    Sound.stopTicker();
    const clamped = Math.max(0, scoreRef.current);
    const awardAmount = Math.round(clamped * bpMultiplier);
    setFinalScore(clamped);
    setPhase("complete");
    recordTingxiePlayRound();
    if (roundCanEarnBPRef.current && awardAmount > 0) awardBP(awardAmount);
    Sound.applause();
    recordTingxieActivityCompleted();
    if (state.activeContent!.lessonId != null) recordLessonCompleted(state.activeContent!.lessonId);
    logAchievement({ type: "tingxieCompleted", detail: `${state.activeContent!.title}|play` });
    checkAndAwardMissionBonus(loadHistory(), awardBP);
  }

  // Countdown timer -- ticks once a second while playing, ends the round the
  // instant it reaches 0.
  useEffect(() => {
    if (phase !== "playing") return;
    Sound.startTicker();
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => {
      clearInterval(id);
      Sound.stopTicker();
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) finishRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // Cloud spawner -- reads currentRef/wordPoolRef (not the `current`/state
  // closures) so this interval's own cadence never has to restart just
  // because a sentence changed a moment ago. Guarantees a cloud for the
  // current answer eventually reappears once none is falling, but rolls the
  // dice each tick rather than forcing it the instant it's missing --
  // forcing it immediately made the correct cloud drop at the same
  // memorizable delay every time, which defeats the point of the game.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setClouds((prev) => {
        const answer = currentRef.current?.answer;
        const hasCorrectFalling = answer != null && prev.some((c) => c.word === answer);
        const pool = wordPoolRef.current;

        let spawnCorrect = false;
        if (answer && !hasCorrectFalling) {
          const now = Date.now();
          if (correctMissingSinceRef.current === null) correctMissingSinceRef.current = now;
          const missingFor = now - correctMissingSinceRef.current;
          spawnCorrect = missingFor >= TINGXIE_PLAY_CONFIG.CORRECT_MAX_ABSENCE_MS || Math.random() < TINGXIE_PLAY_CONFIG.CORRECT_SPAWN_CHANCE;
        } else if (hasCorrectFalling) {
          correctMissingSinceRef.current = null;
        }

        const word = spawnCorrect ? answer! : pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : (answer ?? "");
        if (!word) return prev;
        if (spawnCorrect) correctMissingSinceRef.current = null;
        const cloud: FallingCloud = { id: cloudIdRef.current++, word, x: randomCloudX(), fallSec: randomFallSec() };
        const next = [...prev, cloud];
        return next.length > TINGXIE_PLAY_CONFIG.MAX_CLOUDS ? next.slice(next.length - TINGXIE_PLAY_CONFIG.MAX_CLOUDS) : next;
      });
    }, TINGXIE_PLAY_CONFIG.SPAWN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase]);

  function applyDelta(delta: number) {
    scoreRef.current += delta;
    setFeedback({ delta, key: Date.now() });
  }

  function handleCloudTap(cloud: FallingCloud) {
    setClouds((prev) => prev.filter((c) => c.id !== cloud.id));
    const isCorrect = currentRef.current != null && cloud.word === currentRef.current.answer;
    if (isCorrect) {
      Sound.ding();
      applyDelta(TINGXIE_PLAY_CONFIG.CORRECT_BP);
      advanceSentence();
    } else {
      Sound.miss();
      applyDelta(TINGXIE_PLAY_CONFIG.WRONG_BP);
    }
  }

  function handleCloudFallEnd(id: number) {
    setClouds((prev) => prev.filter((c) => c.id !== id));
  }

  if (!hasBankEntries) {
    return <p className="tingxie-empty">这一课没有可用的词云游戏。No Play exercises available for this lesson.</p>;
  }

  if (phase === "loading") {
    return <p className="tingxie-loading">准备游戏中... Preparing...</p>;
  }

  if (phase === "complete") {
    const capped = !roundCanEarnBPRef.current && finalScore > 0;
    const awardedBP = Math.round(finalScore * bpMultiplier);
    return (
      <CompleteScreen title="游戏结束！Time's Up!" bpAmount={capped ? undefined : awardedBP}>
        {capped && (
          <div className="mission-hint-box">
            <span className="mission-hint-icon">🎮</span>
            <span>
              本局得分 {finalScore}，但今天的词云游戏 BP 奖励已用完（每天前 {TINGXIE_PLAY_CONFIG.DAILY_BP_ROUND_LIMIT} 局才有 BP）。
              <br />
              Score: {finalScore}, but today's Play BP rewards are used up (only the first{" "}
              {TINGXIE_PLAY_CONFIG.DAILY_BP_ROUND_LIMIT} rounds each day earn BP).
            </span>
          </div>
        )}
      </CompleteScreen>
    );
  }

  return (
    <div className="tingxie-play">
      <div className="tingxie-play-timer">⏱ {timeLeft}s</div>

      {!roundCanEarnBPRef.current && (
        <div className="mission-hint-box tingxie-play-cap-banner">
          <span className="mission-hint-icon">🎮</span>
          <span>今天的 BP 奖励已用完，这一局不计 BP，仍可练习。Today's BP rewards are used up — this round is practice only, no BP.</span>
        </div>
      )}

      <div className="tingxie-apply-sentence">{current?.blanked}</div>
      <div className="tingxie-apply-english">{current?.english}</div>

      <div className="tingxie-cloud-sky">
        {clouds.map((cloud) => (
          <button
            key={cloud.id}
            className="tingxie-cloud"
            style={{ left: `${cloud.x}%`, animationDuration: `${cloud.fallSec}s` }}
            onClick={() => handleCloudTap(cloud)}
            onAnimationEnd={() => handleCloudFallEnd(cloud.id)}
          >
            {cloud.word}
          </button>
        ))}
        {feedback && (
          <div key={feedback.key} className={"tingxie-play-feedback " + (feedback.delta > 0 ? "tingxie-play-feedback-correct" : "tingxie-play-feedback-wrong")}>
            {feedback.delta > 0 ? `+${feedback.delta} BP` : `${feedback.delta} BP`}
          </div>
        )}
      </div>
    </div>
  );
}
