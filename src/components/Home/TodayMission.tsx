import { useState } from "react";
import { useAppDispatch, useAppState } from "../../state/AppStateContext";
import { CATEGORIES, VOCABULARY_CATEGORY_KEYS, fetchQuestionCategory } from "../../data/questions";
import { isCategoryRelevantForLevel } from "../../data/levels";
import { MISSION_COMPLETE_BONUS_BP } from "../../data/pet";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { shuffle } from "../../lib/shuffle";
import { isLessonMissionComplete, getReadingMissionCount, isTingxieMissionComplete, READING_MISSION_CATEGORIES } from "../../lib/stats";
import { loadTodaysReadingMission, saveTodaysReadingMission } from "../../state/dailyReadingMission";
import type { HistoryEntry, QuestionIndexEntry } from "../../data/types";

export function TodayMission({ hist }: { hist: HistoryEntry[] }) {
  const dispatch = useAppDispatch();
  const { level, questionIndex } = useAppState();
  const [starting, setStarting] = useState(false);
  const lessonDone = isLessonMissionComplete(hist);
  const readingDone = getReadingMissionCount(hist) >= 1;
  const dictationDone = isTingxieMissionComplete();
  const allDone = lessonDone && readingDone && dictationDone;

  // Picks one lesson number that actually has Vocabulary questions under
  // this level -- see startLessonMission()'s own comment for why this can't
  // just leave "all lessons" selected. Mirrors Practice.tsx's own
  // lessonCounts derivation (same questionIndex, same vocabularyCategoryKeys
  // filter) rather than a subject filter, since this mission always starts
  // from subject "All". Returns null only if no lesson has any eligible
  // question (shouldn't happen with real content, but SELECT_ALL_LESSONS is
  // still a safe fallback below).
  function pickVocabLesson(vocabKeys: string[]): number | null {
    const counts = new Map<number, number>();
    for (const g of questionIndex as QuestionIndexEntry[]) {
      if (g.lessonIds.length === 0 || !vocabKeys.includes(g.category)) continue;
      for (const n of g.lessonIds) counts.set(n, (counts.get(n) ?? 0) + g.questionCount);
    }
    const eligible = [...counts.entries()].filter(([, count]) => count > 0).map(([n]) => n);
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  // Jumps to the Practice screen pre-set for a lesson revision: subject
  // reset to "All" (Vocabulary only exists under Chinese, so a stale
  // "Higher Chinese" subject would leave it greyed out right after this),
  // categories replaced with just Vocabulary (filtered to this level's
  // relevant categories, see data/levels.ts -- e.g. P2 has no "phrase"
  // content), and one lesson pre-picked and selected. This mission
  // specifically counts as done only when a session is started with mode
  // "lesson" (see Practice.tsx's startPractice()), which requires narrowing
  // to at least one specific lesson -- leaving the "all lessons" default
  // selected here (as this used to) meant a student who tapped "去完成" and
  // went straight to "开始练习" without separately picking a lesson number
  // completed a real practice session that still never satisfied the
  // mission.
  function startLessonMission() {
    const vocabKeys = VOCABULARY_CATEGORY_KEYS.filter((k) => isCategoryRelevantForLevel(k, level));
    dispatch({ type: "SELECT_SUBJECT", subject: "All" });
    dispatch({ type: "SET_CATEGORIES", keys: vocabKeys });
    dispatch({ type: "SELECT_ALL_LESSONS" });
    const lessonNum = pickVocabLesson(vocabKeys);
    if (lessonNum !== null) dispatch({ type: "TOGGLE_LESSON", lessonNum });
    dispatch({ type: "GO_TO_SCREEN", screen: "practice" });
  }

  async function startReadingMission() {
    if (starting) return;
    // Pinned to the same question set all day (see
    // state/dailyReadingMission.ts) -- leaving this mission mid-quiz and
    // clicking "去完成" again must not hand back a different random
    // category pick / passage draw than the first attempt today.
    const cached = loadTodaysReadingMission();
    if (cached) {
      dispatch({
        type: "START_QUIZ",
        mode: "type",
        modeLabel: "按题型 " + cached.chosen.map((k) => CATEGORIES[k].label).join("、"),
        groups: cached.groups
      });
      return;
    }

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
      saveTodaysReadingMission({ chosen, groups });
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
      <h2 className="section-heading"><img className="section-heading-icon" src="/icons/todays-mission.png" alt="" />学习任务 Today's Mission</h2>
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
