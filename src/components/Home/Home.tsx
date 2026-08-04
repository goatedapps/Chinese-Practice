import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { loadHistory, clearAllHistory, deleteHistoryEntry } from "../../state/history";
import { getTodayStats, isTingxieMissionComplete } from "../../lib/stats";
import { exportTodaySummaryToPdf } from "../../lib/exportPdf";
import { ConfirmModal } from "../common/Modal";
import { PetHeroCard } from "./PetHeroCard";
import { TodayMission } from "./TodayMission";
import { RecentAchievements } from "./RecentAchievements";

type PendingHistoryAction = { type: "clear" } | { type: "delete"; id: string };

export function Home() {
  const dispatch = useAppDispatch();
  const [hist, setHist] = useState(() => loadHistory());
  const [pending, setPending] = useState<PendingHistoryAction | null>(null);
  const todayStats = getTodayStats(hist);
  const showTodaySummary = todayStats.questions > 0 || isTingxieMissionComplete();

  function handleConfirm() {
    if (!pending) return;
    if (pending.type === "clear") clearAllHistory();
    else deleteHistoryEntry(pending.id);
    setHist(loadHistory());
    setPending(null);
  }

  return (
    <div className="screen home home-dashboard">
      <PetHeroCard hist={hist} />

      <TodayMission hist={hist} />

      <div className="dash-card continue-section">
        <div className="section-eyebrow">下一步 Next up</div>
        <h2 className="section-heading">继续学习 Continue Learning</h2>
        <div className="mode-cards">
          <button className="mode-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "tingxie" })}>
            <div className="mode-card-title">🔊 听写练习</div>
            <div className="mode-card-sub">Dictation Practice</div>
          </button>
          <button className="mode-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "practice" })}>
            <div className="mode-card-title">📘 练习</div>
            <div className="mode-card-sub">Practice</div>
          </button>
        </div>
      </div>

      {showTodaySummary && (
        <div className="dash-card today-summary-card">
          <div className="section-eyebrow">今日总结 Today</div>
          <h2 className="section-heading">今日学习总结 Today's Session Summary</h2>
          <p className="picker-hint">
            <br />
            <span className="en">Print this to show your parents what you have learnt today!</span>
          </p>
          <button className="secondary-btn" onClick={() => exportTodaySummaryToPdf(hist)}>
            🖨️ Print as PDF
          </button>
        </div>
      )}

      <RecentAchievements
        hist={hist}
        onDeleteRow={(id) => setPending({ type: "delete", id })}
        onClearAll={() => setPending({ type: "clear" })}
      />

      {pending && (
        <ConfirmModal
          messageLines={
            pending.type === "clear"
              ? ["确定要清除全部练习记录吗？此操作无法撤销。", "Clear all practice history? This cannot be undone."]
              : ["确定要删除这条记录吗？", "Delete this session record?"]
          }
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
