import { useAppDispatch } from "../../state/AppStateContext";
import { QUESTION_GROUPS, CATEGORIES } from "../../data/questions";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { shuffle } from "../../lib/shuffle";
import { isLessonMissionComplete, getReadingMissionCount, READING_MISSION_CATEGORIES } from "../../lib/stats";
import type { HistoryEntry } from "../../data/types";

export function TodayMission({ hist }: { hist: HistoryEntry[] }) {
  const dispatch = useAppDispatch();
  const lessonDone = isLessonMissionComplete(hist);
  const readingDone = getReadingMissionCount(hist) >= 1;

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
      <div className="section-eyebrow">今日任务 Today's Mission</div>
      <h2 className="section-heading">学习任务 Today's Mission</h2>
      <div className="mission-list">
        <button
          className={"mission-row" + (lessonDone ? " mission-row-done" : "")}
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "lessonPicker" })}
        >
          <span className="mission-icon">📘</span>
          <span className="mission-info">
            <span className="mission-label">
              复习一课
              <span className="en">Revise a Lesson</span>
            </span>
          </span>
          <span className="mission-status">{lessonDone ? "✓ 今日已完成 Done today" : "点击开始 Tap to start"}</span>
        </button>
        <button
          className={"mission-row" + (readingDone ? " mission-row-done" : "")}
          onClick={startReadingMission}
        >
          <span className="mission-icon">📖</span>
          <span className="mission-info">
            <span className="mission-label">
              阅读练习
              <span className="en">Reading Practice</span>
            </span>
          </span>
          <span className="mission-status">{readingDone ? "✓ 今日已完成 Done today" : "点击开始 Tap to start"}</span>
        </button>
      </div>
    </div>
  );
}
