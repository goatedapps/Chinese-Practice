import { useState } from "react";
import { useAppDispatch, useAppState } from "../../state/AppStateContext";
import { CATEGORIES, VOCABULARY_CATEGORY_KEYS, fetchQuestionCategory } from "../../data/questions";
import { isCategoryRelevantForLevel } from "../../data/levels";
import { MISSION_COMPLETE_BONUS_BP } from "../../data/pet";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { shuffle } from "../../lib/shuffle";
import { isLessonMissionComplete, getReadingMissionCount, isTingxieMissionComplete, READING_MISSION_CATEGORIES } from "../../lib/stats";
import type { HistoryEntry } from "../../data/types";

// Interactive half of the "3D carousel" mission cards -- the resting curve
// (left/right cards angled toward the middle one) is pure CSS (see
// ".mission-grid .mission-card:nth-of-type(n)" in styles.css); this just
// layers a live tilt on top while the cursor is over a card, following
// pointer position the way a carousel card would rock as you look around
// it. Skipped entirely under prefers-reduced-motion, matching the CSS
// transition guard on the same elements.
function tiltMissionCard(e: React.MouseEvent<HTMLButtonElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty("--tilt-y", `${px * 20}deg`);
  el.style.setProperty("--tilt-x", `${py * -16}deg`);
  el.style.setProperty("--tilt-z", "20px");
}
function untiltMissionCard(e: React.MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.removeProperty("--tilt-y");
  el.style.removeProperty("--tilt-x");
  el.style.removeProperty("--tilt-z");
}

export function TodayMission({ hist }: { hist: HistoryEntry[] }) {
  const dispatch = useAppDispatch();
  const { level } = useAppState();
  const [starting, setStarting] = useState(false);
  const lessonDone = isLessonMissionComplete(hist);
  const readingDone = getReadingMissionCount(hist) >= 1;
  const dictationDone = isTingxieMissionComplete();
  const allDone = lessonDone && readingDone && dictationDone;

  // Jumps to the Practice screen pre-set for a lesson revision: subject
  // reset to "All" (Vocabulary only exists under Chinese, so a stale
  // "Higher Chinese" subject would leave it greyed out right after this),
  // categories replaced with just Vocabulary (filtered to this level's
  // relevant categories, see data/levels.ts -- e.g. P2 has no "phrase"
  // content), and lessons reset to the "all lessons" default so the student
  // picks which lesson(s) themselves.
  function startLessonMission() {
    dispatch({ type: "SELECT_SUBJECT", subject: "All" });
    dispatch({ type: "SET_CATEGORIES", keys: VOCABULARY_CATEGORY_KEYS.filter((k) => isCategoryRelevantForLevel(k, level)) });
    dispatch({ type: "SELECT_ALL_LESSONS" });
    dispatch({ type: "GO_TO_SCREEN", screen: "practice" });
  }

  async function startReadingMission() {
    if (starting) return;
    const chosen = shuffle(READING_MISSION_CATEGORIES).slice(0, 2);
    setStarting(true);
    try {
      const lists = await Promise.all(chosen.map((c) => fetchQuestionCategory(c)));
      const groups = selectTypeSessionGroups(lists.flat());
      if (groups.length === 0) return;
      dispatch({
        type: "START_QUIZ",
        mode: "type",
        modeLabel: "按题型 " + chosen.map((k) => CATEGORIES[k].label).join("、"),
        groups
      });
    } catch {
      alert("加载题目失败，请重试。Failed to load questions, please try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="dash-card today-mission">
      <h2 className="section-heading">学习任务 Today's Mission</h2>
      <p className="mission-subhead">Complete all missions to earn {MISSION_COMPLETE_BONUS_BP} BP</p>
      <div className="mission-grid">
        <button
          className={"mission-card" + (dictationDone ? " mission-card-done" : "")}
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "tingxie" })}
          onMouseMove={tiltMissionCard}
          onMouseLeave={untiltMissionCard}
        >
          <div className="mission-card-top" style={{ backgroundImage: "url(/icons/dictation-bg.png)" }}>
            <img className="mission-card-icon" src="/icons/dictation.png" alt="" />
            <span className={"mission-card-badge" + (dictationDone ? " mission-card-badge-done" : " mission-card-badge-todo")}>
              {dictationDone ? "✓" : "›"}
            </span>
          </div>
          <div className="mission-card-bottom">
            <span className="mission-card-name">听写练习</span>
          </div>
        </button>
        <button
          className={"mission-card" + (lessonDone ? " mission-card-done" : "")}
          onClick={startLessonMission}
          onMouseMove={tiltMissionCard}
          onMouseLeave={untiltMissionCard}
        >
          <div className="mission-card-top" style={{ backgroundImage: "url(/icons/read-bg.png)" }}>
            <img className="mission-card-icon" src="/icons/read.png" alt="" />
            <span className={"mission-card-badge" + (lessonDone ? " mission-card-badge-done" : " mission-card-badge-todo")}>
              {lessonDone ? "✓" : "›"}
            </span>
          </div>
          <div className="mission-card-bottom">
            <span className="mission-card-name">词语复习</span>
          </div>
        </button>
        <button
          className={"mission-card" + (readingDone ? " mission-card-done" : "")}
          disabled={starting}
          onClick={startReadingMission}
          onMouseMove={tiltMissionCard}
          onMouseLeave={untiltMissionCard}
        >
          <div className="mission-card-top" style={{ backgroundImage: "url(/icons/practice-bg.png)" }}>
            <img className="mission-card-icon" src="/icons/practice.png" alt="" />
            <span className={"mission-card-badge" + (readingDone ? " mission-card-badge-done" : " mission-card-badge-todo")}>
              {readingDone ? "✓" : "›"}
            </span>
          </div>
          <div className="mission-card-bottom">
            <span className="mission-card-name">阅读理解</span>
          </div>
        </button>
      </div>

      {allDone && (
        <div className="mission-bonus-banner">
          🎉 三项任务全部完成！All 3 missions done today! <span className="bp-pop">+{MISSION_COMPLETE_BONUS_BP} BP</span>
        </div>
      )}
    </div>
  );
}
