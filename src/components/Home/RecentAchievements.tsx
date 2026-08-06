import { formatRelativeTime } from "../../lib/stats";
import { specialQuestConfig } from "../../data/pet";
import { parseTingxieCompletedDetail } from "../../state/achievements";
import type { Achievement, HistoryEntry } from "../../data/types";

const TYPE_ICON: Record<Achievement["type"], string> = {
  missionComplete: "🎯",
  questionsMilestone: "🏆",
  storyCompleted: "📖",
  specialQuestComplete: "🎡",
  tingxieCompleted: "🔊"
};

function describe(a: Achievement): { text: string; en?: string } {
  switch (a.type) {
    case "missionComplete":
      return { text: "今日任务全部完成", en: "All missions complete today" };
    case "questionsMilestone":
      return { text: `累计完成 ${a.detail} 题`, en: `${a.detail} questions completed` };
    case "storyCompleted":
      return { text: `读完第 ${a.detail} 课的故事`, en: `Finished reading Lesson ${a.detail}'s story` };
    case "specialQuestComplete": {
      const config = a.detail ? specialQuestConfig(a.detail) : undefined;
      return { text: `完成特别任务：${config?.label.split(" ")[0] ?? ""}`, en: `Special Quest complete (+${config?.bonusBP ?? 0} BP)` };
    }
    case "tingxieCompleted": {
      const { lessonTitle, activityLabel } = parseTingxieCompletedDetail(a.detail);
      return { text: `完成听写练习：${lessonTitle}（${activityLabel.zh}）`, en: `Dictation: ${lessonTitle} — ${activityLabel.en}` };
    }
    default:
      return { text: "" };
  }
}

type FeedRow =
  | { kind: "achievement"; id: string; date: number; icon: string; text: string; en?: string }
  | { kind: "session"; id: string; date: number; modeLabel: string; correctItems: number; totalItems: number };

const MAX_ROWS = 5;

export function RecentAchievements({
  hist,
  achievements,
  onDeleteRow
}: {
  hist: HistoryEntry[];
  achievements: Achievement[];
  onDeleteRow: (id: string) => void;
}) {
  const achievementRows: FeedRow[] = achievements
    // Defensive filter: pre-existing "fed"/"evolved" entries from before
    // pet-interaction achievements stopped being tracked can still be
    // sitting in a student's localStorage -- never surface those.
    .filter(
      (a) =>
        a.type === "missionComplete" ||
        a.type === "questionsMilestone" ||
        a.type === "storyCompleted" ||
        a.type === "specialQuestComplete" ||
        a.type === "tingxieCompleted"
    )
    .map((a) => {
      const { text, en } = describe(a);
      return { kind: "achievement", id: a.id, date: a.date, icon: TYPE_ICON[a.type], text, en };
    });

  const sessionRows: FeedRow[] = hist.map((h) => ({
    kind: "session",
    id: h.id,
    date: h.date,
    modeLabel: h.modeLabel,
    correctItems: h.correctItems,
    totalItems: h.totalItems
  }));

  const rows = [...achievementRows, ...sessionRows].sort((a, b) => b.date - a.date).slice(0, MAX_ROWS);

  if (rows.length === 0) return null;

  return (
    <div className="dash-card recent-achievements">
      <div className="history-head">
        <h2 className="section-heading">最近成就 Recent Achievements</h2>
      </div>
      <div className="achievement-list">
        {rows.map((row) =>
          row.kind === "achievement" ? (
            <div className="achievement-row" key={`a-${row.id}`}>
              <span className="achievement-icon">{row.icon}</span>
              <span className="achievement-text">
                {row.text}
                {row.en && <span className="en">{row.en}</span>}
              </span>
              <span className="achievement-date">{formatRelativeTime(row.date)}</span>
            </div>
          ) : (
            <div className="achievement-row" key={`s-${row.id}`}>
              <span className="achievement-icon">📘</span>
              <span className="achievement-text">
                {row.modeLabel}
                <span className="en">
                  {row.correctItems}/{row.totalItems} correct
                </span>
              </span>
              <span className="achievement-date">{formatRelativeTime(row.date)}</span>
              <button className="history-row-delete" title="删除 Delete" onClick={() => onDeleteRow(row.id)}>
                ✕
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
