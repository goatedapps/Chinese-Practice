import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { loadHistory, clearAllHistory, deleteHistoryEntry } from "../../state/history";
import { loadAchievements, clearAllAchievements } from "../../state/achievements";
import { getTodayStats, isTingxieMissionComplete } from "../../lib/stats";
import { getTodaySummary } from "../../state/todaySummary";
import { exportTodaySummaryToPdf } from "../../lib/exportPdf";
import { ConfirmModal } from "../common/Modal";
import { PetHeroCard } from "./PetHeroCard";
import { TodayMission } from "./TodayMission";
import { RecentAchievements } from "./RecentAchievements";

type PendingHistoryAction = { type: "clear" } | { type: "delete"; id: string };

export function Home() {
  const dispatch = useAppDispatch();
  const [hist, setHist] = useState(() => loadHistory());
  const [achievements, setAchievements] = useState(() => loadAchievements());
  const [pending, setPending] = useState<PendingHistoryAction | null>(null);
  const todayStats = getTodayStats(hist);
  const showTodaySummary = todayStats.questions > 0 || isTingxieMissionComplete() || getTodaySummary().storiesRead.length > 0;

  function handleConfirm() {
    if (!pending) return;
    if (pending.type === "clear") {
      // "Clear All" clears the whole merged feed shown by RecentAchievements
      // (session history + the achievement log), not just history -- clearing
      // only history used to leave achievement rows (e.g. "All missions
      // complete today") still visible afterward, which looked broken.
      clearAllHistory();
      clearAllAchievements();
      setAchievements(loadAchievements());
    } else {
      deleteHistoryEntry(pending.id);
    }
    setHist(loadHistory());
    setPending(null);
  }

  return (
    <div className="screen home home-dashboard">
      <PetHeroCard hist={hist} />

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

      <RecentAchievements
        hist={hist}
        achievements={achievements}
        onDeleteRow={(id) => setPending({ type: "delete", id })}
        onClearAll={() => setPending({ type: "clear" })}
      />

      {pending && (
        <ConfirmModal
          messageLines={
            pending.type === "clear"
              ? ["确定要清除全部练习记录和成就吗？此操作无法撤销。", "Clear all practice history and achievements? This cannot be undone."]
              : ["确定要删除这条记录吗？", "Delete this session record?"]
          }
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
