import { useState } from "react";
import { loadAchievements } from "../../state/achievements";
import { formatRelativeTime } from "../../lib/stats";
import { SHOP_ITEMS, PET_STAGES } from "../../data/pet";
import type { Achievement } from "../../data/types";

const TYPE_ICON: Record<Achievement["type"], string> = {
  fed: "🍚",
  evolved: "✨",
  missionComplete: "🎯",
  questionsMilestone: "🏆"
};

function describe(a: Achievement): { text: string; en?: string } {
  switch (a.type) {
    case "fed": {
      const item = SHOP_ITEMS.find((i) => i.id === a.detail);
      const emoji = item?.label.split(" ")[0] ?? "";
      const name = item ? item.label.slice(emoji.length).trim() : "宠物 the pet";
      return { text: `喂食了 ${name}` };
    }
    case "evolved": {
      const stage = PET_STAGES.find((s) => s.key === a.detail);
      return { text: `宠物进化为 ${stage?.label ?? a.detail}` };
    }
    case "missionComplete":
      return { text: "今日任务全部完成", en: "All missions complete today" };
    case "questionsMilestone":
      return { text: `累计完成 ${a.detail} 题`, en: `${a.detail} questions completed` };
    default:
      return { text: "" };
  }
}

export function RecentAchievements() {
  const [achievements] = useState(() => loadAchievements());
  if (achievements.length === 0) return null;

  return (
    <div className="dash-card recent-achievements">
      <div className="section-eyebrow">最近成就 Recent</div>
      <h2 className="section-heading">最近成就 Recent Achievements</h2>
      <div className="achievement-list">
        {achievements.slice(0, 5).map((a) => {
          const { text, en } = describe(a);
          return (
            <div className="achievement-row" key={a.id}>
              <span className="achievement-icon">{TYPE_ICON[a.type]}</span>
              <span className="achievement-text">
                {text}
                {en && <span className="en">{en}</span>}
              </span>
              <span className="achievement-date">{formatRelativeTime(a.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
