import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { CATEGORIES, VOCABULARY_CATEGORY_KEYS, fetchQuestionCategory } from "../../data/questions";
import { MISSION_COMPLETE_BONUS_BP } from "../../data/pet";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { shuffle } from "../../lib/shuffle";
import { isLessonMissionComplete, getReadingMissionCount, isTingxieMissionComplete, READING_MISSION_CATEGORIES } from "../../lib/stats";
import type { HistoryEntry } from "../../data/types";

export function TodayMission({ hist }: { hist: HistoryEntry[] }) {
  const dispatch = useAppDispatch();
  const [starting, setStarting] = useState(false);
  const lessonDone = isLessonMissionComplete(hist);
  const readingDone = getReadingMissionCount(hist) >= 1;
  const dictationDone = isTingxieMissionComplete();
  const allDone = lessonDone && readingDone && dictationDone;

  // Jumps to the Practice screen pre-set for a lesson revision: subject
  // reset to "All" (Vocabulary only exists under Chinese, so a stale
  // "Higher Chinese" subject would leave it greyed out right after this),
  // categories replaced with just Vocabulary, and lessons reset to the "all
  // lessons" default so the student picks which lesson(s) themselves.
  function startLessonMission() {
    dispatch({ type: "SELECT_SUBJECT", subject: "All" });
    dispatch({ type: "SET_CATEGORIES", keys: VOCABULARY_CATEGORY_KEYS });
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
