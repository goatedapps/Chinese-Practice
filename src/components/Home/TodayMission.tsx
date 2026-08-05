import { useAppDispatch } from "../../state/AppStateContext";
import { QUESTION_GROUPS, CATEGORIES, VOCABULARY_CATEGORY_KEYS } from "../../data/questions";
import { MISSION_COMPLETE_BONUS_BP } from "../../data/pet";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { shuffle } from "../../lib/shuffle";
import { isLessonMissionComplete, getReadingMissionCount, isTingxieMissionComplete, READING_MISSION_CATEGORIES } from "../../lib/stats";
import type { HistoryEntry } from "../../data/types";

export function TodayMission({ hist }: { hist: HistoryEntry[] }) {
  const dispatch = useAppDispatch();
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

  function startReadingMission() {
    const chosen = shuffle(READING_MISSION_CATEGORIES).slice(0, 2);
    const candidates = QUESTION_GROUPS.filter((g) => chosen.includes(g.category));
    const groups = selectTypeSessionGroups(candidates);
    if (groups.length === 0) return;
    dispatch({
      type: "START_QUIZ",
      mode: "type",
      modeLabel: "按题型 " + chosen.map((k) => CATEGORIES[k].label).join("、"),
      groups
    });
  }

  return (
    <div className="dash-card today-mission">
      <h2 className="section-heading">学习任务 Today's Mission</h2>
      <p className="mission-subhead">完成全部任务可得 {MISSION_COMPLETE_BONUS_BP} BP · Complete all missions to earn {MISSION_COMPLETE_BONUS_BP} BP</p>
      <div className="mission-grid">
        <button
          className={"mission-card" + (lessonDone ? " mission-card-done" : "")}
          onClick={startLessonMission}
        >
          <img className="mission-card-icon" src="/icons/learn.png" alt="" />
          <span className="mission-card-name">复习一课</span>
          <span className="mission-card-tick-slot">{lessonDone && <span className="mission-card-tick">✓</span>}</span>
        </button>
        <button
          className={"mission-card" + (readingDone ? " mission-card-done" : "")}
          onClick={startReadingMission}
        >
          <span className="mission-card-icon mission-card-icon-emoji">📖</span>
          <span className="mission-card-name">阅读练习</span>
          <span className="mission-card-tick-slot">{readingDone && <span className="mission-card-tick">✓</span>}</span>
        </button>
        <button
          className={"mission-card" + (dictationDone ? " mission-card-done" : "")}
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "tingxie" })}
        >
          <img className="mission-card-icon" src="/icons/dictation.png" alt="" />
          <span className="mission-card-name">听写练习</span>
          <span className="mission-card-tick-slot">{dictationDone && <span className="mission-card-tick">✓</span>}</span>
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
