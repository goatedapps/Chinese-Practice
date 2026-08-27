import { useState } from "react";
import { useAppDispatch, useAppState } from "../../state/AppStateContext";
import { CATEGORIES, VOCABULARY_CATEGORY_KEYS, fetchQuestionCategory } from "../../data/questions";
import { isCategoryRelevantForLevel } from "../../data/levels";
import { MISSION_COMPLETE_BONUS_BP } from "../../data/pet";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { shuffle } from "../../lib/shuffle";
import { isLessonMissionComplete, getReadingMissionCount, isTingxieMissionComplete, READING_MISSION_CATEGORIES } from "../../lib/stats";
import { Icon } from "../common/Icons";
import type { HistoryEntry } from "../../data/types";

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
    // Filtered to this level's relevant categories first (see
    // data/levels.ts) -- e.g. P2 has no real dialogue/practical content, so
    // without this filter a 1-in-6 shuffle could pick both of those and
    // silently no-op below once selectTypeSessionGroups() drops them.
    const chosen = shuffle(READING_MISSION_CATEGORIES.filter((c) => isCategoryRelevantForLevel(c, level))).slice(0, 2);
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
      <h2 className="section-heading"><Icon name="target" />学习任务 Today's Mission</h2>
      <p className="mission-subhead">Complete all missions to earn {MISSION_COMPLETE_BONUS_BP} BP</p>
      <div className="mission-list">
        <div className={"mission-row p1" + (dictationDone ? " mission-row-done" : "")}>
          <span className="mission-num">1</span>
          <span className="mission-info">
            <span className="mission-title">听写练习</span>
            <span className="mission-status">Dictation Practice</span>
          </span>
          <span className="mission-right">
            <span className="mission-icon-box"><img src="/icons/dictatation-mission.png" alt="" /></span>
            {dictationDone ? (
              <span className="mission-done">✓ 已完成</span>
            ) : (
              <button className="mission-go" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "tingxie" })}>
                去完成
              </button>
            )}
          </span>
        </div>
        <div className={"mission-row p2" + (lessonDone ? " mission-row-done" : "")}>
          <span className="mission-num">2</span>
          <span className="mission-info">
            <span className="mission-title">词语复习</span>
            <span className="mission-status">Vocabulary Review</span>
          </span>
          <span className="mission-right">
            <span className="mission-icon-box"><img src="/icons/practice-mission.png" alt="" /></span>
            {lessonDone ? (
              <span className="mission-done">✓ 已完成</span>
            ) : (
              <button className="mission-go" onClick={startLessonMission}>
                去完成
              </button>
            )}
          </span>
        </div>
        <div className={"mission-row p3" + (readingDone ? " mission-row-done" : "")}>
          <span className="mission-num">3</span>
          <span className="mission-info">
            <span className="mission-title">阅读理解</span>
            <span className="mission-status">Reading Comprehension</span>
          </span>
          <span className="mission-right">
            <span className="mission-icon-box"><img src="/icons/read-mission.png" alt="" /></span>
            {readingDone ? (
              <span className="mission-done">✓ 已完成</span>
            ) : (
              <button className="mission-go" disabled={starting} onClick={startReadingMission}>
                {starting ? "…" : "去完成"}
              </button>
            )}
          </span>
        </div>
      </div>

      {allDone && (
        <div className="mission-bonus-banner">
          三项任务全部完成！All 3 missions done today! <span className="bp-pop">+{MISSION_COMPLETE_BONUS_BP} BP</span>
        </div>
      )}
    </div>
  );
}
