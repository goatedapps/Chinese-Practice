import { useState } from "react";
import { loadHistory, deleteHistoryEntry } from "../../state/history";
import { loadAchievements } from "../../state/achievements";
import { getTodayStats, isTingxieMissionComplete } from "../../lib/stats";
import { getTodaySummary } from "../../state/todaySummary";
import { exportTodaySummaryToPdf } from "../../lib/exportPdf";
import { ConfirmModal } from "../common/Modal";
import { Reveal } from "../common/Reveal";
import { Icon } from "../common/Icons";
import { PetHeroCard } from "./PetHeroCard";
import { TodayMission } from "./TodayMission";
import { SpecialQuest } from "./SpecialQuest";
import { RecentAchievements } from "./RecentAchievements";
import { bpBoostActive } from "../../lib/bpBoost";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export function Home() {
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
      <div className="home-content">
        <Reveal delay={0}>
          <div className="home-greeting">
            <h1>
              {greeting()}
              <Icon name="sparkle" className="home-greeting-spark" />
            </h1>
            <p>
              {todayStats.questions > 0
                ? `你今天已经完成 ${todayStats.questions} 题，继续保持！`
                : "今天还没开始练习，快来陪陪你的小伙伴吧！"}
            </p>
          </div>
        </Reveal>

        {bpBoostActive && (
          <Reveal delay={10}>
            <div className="boost-day-banner">
              <Icon name="sparkle" className="boost-day-banner-sparkle boost-day-banner-sparkle-1" />
              <Icon name="sparkle" className="boost-day-banner-sparkle boost-day-banner-sparkle-2" />
              <Icon name="sparkle" className="boost-day-banner-sparkle boost-day-banner-sparkle-3" />
              <span className="boost-day-banner-icon-wrap">
                <img className="boost-day-banner-icon" src="/icons/bonus-day.png" alt="" />
              </span>
              <span className="boost-day-banner-text">
                <span className="boost-day-banner-title">双倍 BP 日！</span>
                <span className="boost-day-banner-sub">今天完成练习，获得的 BP 全部 ×2！</span>
              </span>
              <span className="boost-day-banner-badge">×2</span>
            </div>
          </Reveal>
        )}

        <div className="home-row-top">
          <Reveal delay={20}>
            <PetHeroCard />
          </Reveal>
          <Reveal delay={80}>
            <SpecialQuest />
          </Reveal>
          <Reveal delay={140}>
            <TodayMission hist={hist} />
          </Reveal>
        </div>

        <div className="home-row-bottom">
          <Reveal delay={200}>
            <RecentAchievements hist={hist} achievements={achievements} onDeleteRow={setPendingDeleteId} />
          </Reveal>

          {showTodaySummary && (
            <Reveal delay={260}>
              <div className="dash-card today-summary-card">
                <div className="today-summary-left">
                  <h2 className="section-heading"><img className="section-heading-icon" src="/icons/todays-summary.png" alt="" />今日学习总结 Today's Session Summary</h2>
                  <p className="picker-hint">
                    <span className="en">Print this to show your parents what you have learnt today!</span>
                  </p>
                </div>
                <div className="today-summary-right">
                  <img src="/icons/printer.png" alt="" />
                  <button className="secondary-btn today-summary-print-btn" onClick={() => exportTodaySummaryToPdf(hist)}>
                    打印为 PDF
                  </button>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {pendingDeleteId && (
          <ConfirmModal
            messageLines={["确定要删除这条记录吗？", "Delete this session record?"]}
            onConfirm={handleConfirm}
            onCancel={() => setPendingDeleteId(null)}
          />
        )}

        <footer className="home-footer">Created by Yiwen and Claude, Copyright 2026</footer>
      </div>
    </div>
  );
}
