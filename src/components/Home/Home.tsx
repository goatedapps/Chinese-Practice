import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { loadHistory, clearAllHistory, deleteHistoryEntry } from "../../state/history";
import { getTodayStats } from "../../lib/stats";
import { ConfirmModal } from "../common/Modal";
import { PetHeroCard } from "./PetHeroCard";
import { TodayMission } from "./TodayMission";
import { ProgressSummary } from "./ProgressSummary";
import { RecentAchievements } from "./RecentAchievements";

type PendingHistoryAction = { type: "clear" } | { type: "delete"; id: string };

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好 Good morning";
  if (hour < 18) return "下午好 Good afternoon";
  return "晚上好 Good evening";
}

export function Home() {
  const dispatch = useAppDispatch();
  const [hist, setHist] = useState(() => loadHistory());
  const [pending, setPending] = useState<PendingHistoryAction | null>(null);
  const { questions } = getTodayStats(hist);

  function handleConfirm() {
    if (!pending) return;
    if (pending.type === "clear") clearAllHistory();
    else deleteHistoryEntry(pending.id);
    setHist(loadHistory());
    setPending(null);
  }

  return (
    <div className="screen home home-dashboard">
      <div className="home-welcome">
        <h1 className="home-greeting">{greeting()} 👋</h1>
        <p className="home-subgreeting">
          {questions > 0
            ? `你今天已经完成 ${questions} 题，继续保持！You've done ${questions} questions today — keep it up!`
            : "今天还没开始练习，快来陪陪你的小伙伴吧！No practice yet today — let's get started with your buddy!"}
        </p>
      </div>

      <PetHeroCard />

      <TodayMission hist={hist} />

      <div className="dash-card continue-section">
        <div className="section-eyebrow">下一步 Next up</div>
        <h2 className="section-heading">继续学习 Continue Learning</h2>
        <div className="mode-cards">
          <button className="mode-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "lessonPicker" })}>
            <div className="mode-card-title">📘 按课文练习</div>
            <div className="mode-card-sub">Practice by Lesson</div>
          </button>
          <button className="mode-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "typePicker" })}>
            <div className="mode-card-title">🧩 按题型练习</div>
            <div className="mode-card-sub">Practice by Question Type</div>
          </button>
          <button className="mode-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "tingxie" })}>
            <div className="mode-card-title">🔊 听写练习</div>
            <div className="mode-card-sub">Dictation Practice</div>
          </button>
        </div>
      </div>

      <ProgressSummary hist={hist} />

      <RecentAchievements />

      {hist.length > 0 && (
        <div className="dash-card history-card">
          <div className="history-head">
            <h2>最近记录 Recent Sessions</h2>
            <button className="history-clear-btn" onClick={() => setPending({ type: "clear" })}>
              🗑 清除全部 Clear All
            </button>
          </div>
          <table className="history-table">
            <thead>
              <tr>
                <th>日期 Date</th>
                <th>模式 Mode</th>
                <th>得分 Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {hist.slice(0, 8).map((h) => (
                <tr key={h.id}>
                  <td>{new Date(h.date).toLocaleString()}</td>
                  <td>{h.modeLabel}</td>
                  <td className="score">
                    {h.correctItems}/{h.totalItems}
                  </td>
                  <td>
                    <button
                      className="history-row-delete"
                      title="删除 Delete"
                      onClick={() => setPending({ type: "delete", id: h.id })}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
