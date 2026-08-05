import { useEffect, useRef, useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { saveHistory, loadHistory } from "../../state/history";
import { logAchievement, checkAndAwardMissionBonus } from "../../state/achievements";
import { recordTodayPracticeSession } from "../../state/todaySummary";
import { getTodaySpecialQuest, completeSpecialQuest } from "../../state/specialQuest";
import { specialQuestConfig } from "../../data/pet";
import { VOCABULARY_CATEGORY_KEYS } from "../../data/questions";
import { Sound } from "../../lib/sound";
import { exportSessionToPdf } from "../../lib/exportPdf";

export function Result() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { pet, recordQuestionsCompleted, awardBP } = usePet();
  // Read before recordQuestionsCompleted runs below -- avoids reading a
  // stale/batched value back out of context in the same effect.
  const beforeQuestions = pet.questionsLifetime;
  const [questBonusBP, setQuestBonusBP] = useState<number | null>(null);

  let totalItems = 0;
  let correctItems = 0;
  let skippedItems = 0;
  state.results.forEach((r) =>
    r.items.forEach((it) => {
      totalItems += 1;
      if (it.correct === true) correctItems += 1;
      if (it.skipped) skippedItems += 1;
    })
  );

  const pct = totalItems ? Math.round((correctItems / totalItems) * 100) : 0;

  // Runs once when the result screen is first shown for this session, same
  // as the old renderResult()'s saveHistory() call. Guarded by a ref (not
  // just the empty dep array) because React 18 StrictMode double-invokes
  // empty-dep effects once on mount in dev -- harmless for the old
  // idempotent saveHistory-only version of this effect, but the achievement
  // logging added below is NOT idempotent (it appends), so this effect must
  // truly run once per mount, not "twice in dev, deduped by luck."
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const categoryCounts: Record<string, number> = {};
    state.groups.forEach((g) => {
      categoryCounts[g.category] = (categoryCounts[g.category] ?? 0) + 1;
    });

    saveHistory({
      date: Date.now(),
      modeLabel: state.modeLabel || "",
      mode: state.mode ?? undefined,
      totalItems,
      correctItems,
      skippedItems,
      categoryCounts
    });
    if (state.groups.length > 0) {
      recordTodayPracticeSession({ modeLabel: state.modeLabel || "", groups: state.groups, results: state.results });
    }
    if (totalItems > 0) {
      if (pct >= 90) Sound.applause();
      else Sound.encourage();
    }

    recordQuestionsCompleted(totalItems);
    const afterQuestions = beforeQuestions + totalItems;
    for (let m = Math.floor(beforeQuestions / 100) + 1; m * 100 <= afterQuestions; m++) {
      logAchievement({ type: "questionsMilestone", detail: String(m * 100) });
    }

    checkAndAwardMissionBonus(loadHistory(), awardBP);

    // "Get 100% on a Vocab Quiz" / "Complete one Comprehension passage"
    // Special Quests -- see components/Home/SpecialQuest.tsx. Fires for any
    // qualifying session finished today, not only one launched via the
    // quest's own "Do Quest" button -- an organic Practice session that
    // happens to match satisfies it too. Uses raw correctItems/totalItems,
    // not the rounded `pct`, so a near-100% session can't false-positive.
    const quest = getTodaySpecialQuest();
    const questMatches =
      state.groups.length > 0 &&
      ((quest?.questId === "vocab100" &&
        state.groups.every((g) => VOCABULARY_CATEGORY_KEYS.includes(g.category)) &&
        correctItems === totalItems) ||
        (quest?.questId === "comprehension1" && state.groups.every((g) => g.category === "comprehension")));
    if (quest && questMatches && completeSpecialQuest(quest.questId)) {
      const questConfig = specialQuestConfig(quest.questId);
      if (questConfig) {
        awardBP(questConfig.bonusBP);
        setQuestBonusBP(questConfig.bonusBP);
      }
      logAchievement({ type: "specialQuestComplete", detail: quest.questId });
    }
    // Intentionally empty deps: save the session exactly once, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen result">
      <h1>练习结果 Practice Results</h1>
      <div className="score-circle">{pct}%</div>
      <p className="score-detail">
        {`答对 ${correctItems} / ${totalItems} 题${skippedItems ? `（${skippedItems} 题未作答或未自评）` : ""}`}
      </p>
      {questBonusBP !== null && (
        <p className="quest-bonus-banner">
          🎯 特别任务完成！Special Quest complete! <span className="bp-pop">+{questBonusBP} BP</span>
        </p>
      )}
      <div className="action-row">
        {state.mode === "type" && (
          <button
            className="secondary-btn"
            onClick={() =>
              exportSessionToPdf(state.groups, state.results, {
                modeLabel: state.modeLabel,
                pct,
                correctItems,
                totalItems,
                skippedItems
              })
            }
          >
            🖨️ 存为 PDF Print as PDF
          </button>
        )}
        <button className="primary-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
          返回主页 Back to Home
        </button>
      </div>
    </div>
  );
}
