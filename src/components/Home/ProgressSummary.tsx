import { getTodayStats, getStreak } from "../../lib/stats";
import type { HistoryEntry } from "../../data/types";

export function ProgressSummary({ hist }: { hist: HistoryEntry[] }) {
  const { questions, accuracy } = getTodayStats(hist);
  const streak = getStreak(hist);

  return (
    <div className="dash-card progress-summary">
      <div className="section-eyebrow">今日战绩 Today's stats</div>
      <h2 className="section-heading">学习进度 Progress Summary</h2>
      <div className="stat-tile-grid">
        <div className="stat-tile">
          <div className="stat-tile-badge tone-primary">{questions}</div>
          <div className="stat-tile-label">
            今日题数
            <span className="en">Questions Today</span>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-badge tone-primary">{accuracy}%</div>
          <div className="stat-tile-label">
            今日正确率
            <span className="en">Accuracy Today</span>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-badge tone-gold">🔥 {streak}</div>
          <div className="stat-tile-label">
            连续天数
            <span className="en">Day Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
