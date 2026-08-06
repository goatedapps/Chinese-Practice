import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { loadHistory, deleteHistoryEntry } from "../../state/history";
import { loadAchievements } from "../../state/achievements";
import { getTodayStats, isTingxieMissionComplete } from "../../lib/stats";
import { getTodaySummary } from "../../state/todaySummary";
import { exportTodaySummaryToPdf } from "../../lib/exportPdf";
import { ConfirmModal } from "../common/Modal";
import { PetHeroCard } from "./PetHeroCard";
import { TodayMission } from "./TodayMission";
import { SpecialQuest } from "./SpecialQuest";
import { RecentAchievements } from "./RecentAchievements";

export function Home() {
  const dispatch = useAppDispatch();
  const [hist, setHist] = useState(() => loadHistory());
  const [achievements] = useState(() => loadAchievements());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const todayStats = getTodayStats(hist);
  const showTodaySummary = todayStats.questions > 0 || isTingxieMissionComplete() || getTodaySummary().storiesRead.length > 0;

  function handleConfirm() {
    if (!pendingDeleteId) return;
    deleteHistoryEntry(pendingDeleteId);
    setHist(loadHistory());
    setPendingDeleteId(null);
  }

  return (
    <div className="screen home home-dashboard">
      <PetHeroCard hist={hist} />

      <SpecialQuest />

      <TodayMission hist={hist} />

      <div className="dash-card continue-section">
        <h2 className="section-heading">继续学习 Continue Learning</h2>
        <div className="mode-rows">
          <button className="mode-row" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "tingxie" })}>
            <img className="mode-row-icon" src="/icons/dictation.png" alt="" />
            <span className="mode-row-info">
              <span className="mode-row-title">听写练习</span>
              <span className="mode-row-sub">Dictation Practice</span>
            </span>
            <span className="mode-row-go">›</span>
          </button>
          <button className="mode-row" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "practice" })}>
            <img className="mode-row-icon" src="/icons/practice.png" alt="" />
            <span className="mode-row-info">
              <span className="mode-row-title">练习</span>
              <span className="mode-row-sub">Practice</span>
            </span>
            <span className="mode-row-go">›</span>
          </button>
          <button className="mode-row" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "story" })}>
            <img className="mode-row-icon" src="/icons/read.png" alt="" />
            <span className="mode-row-info">
              <span className="mode-row-title">读故事</span>
              <span className="mode-row-sub">Read a Story</span>
            </span>
            <span className="mode-row-go">›</span>
          </button>
        </div>
      </div>

      {showTodaySummary && (
        <div className="dash-card today-summary-card">
          <h2 className="section-heading">今日学习总结 Today's Session Summary</h2>
          <p className="picker-hint">
            <span className="en">Print this to show your parents what you have learnt today!</span>
          </p>
          <button className="secondary-btn" onClick={() => exportTodaySummaryToPdf(hist)}>
            🖨️ Print as PDF
          </button>
        </div>
      )}

      <RecentAchievements hist={hist} achievements={achievements} onDeleteRow={setPendingDeleteId} />

      {pendingDeleteId && (
        <ConfirmModal
          messageLines={["确定要删除这条记录吗？", "Delete this session record?"]}
          onConfirm={handleConfirm}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
