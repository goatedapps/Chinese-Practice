import { useEffect, useRef } from "react";
import { useAppState, useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { saveHistory, loadHistory } from "../../state/history";
import { logAchievement, checkAndAwardMissionBonus } from "../../state/achievements";
import { Sound } from "../../lib/sound";

export function Result() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { pet, recordQuestionsCompleted, awardBP } = usePet();
  // Read before recordQuestionsCompleted runs below -- avoids reading a
  // stale/batched value back out of context in the same effect.
  const beforeQuestions = pet.questionsLifetime;

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
    if (totalItems > 0) {
      if (pct === 100) Sound.applause();
      else Sound.encourage();
    }

    recordQuestionsCompleted(totalItems);
    const afterQuestions = beforeQuestions + totalItems;
    for (let m = Math.floor(beforeQuestions / 100) + 1; m * 100 <= afterQuestions; m++) {
      logAchievement({ type: "questionsMilestone", detail: String(m * 100) });
    }

    checkAndAwardMissionBonus(loadHistory(), awardBP);
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
      <div className="action-row">
        <button className="primary-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
          返回主页 Back to Home
        </button>
      </div>
    </div>
  );
}
