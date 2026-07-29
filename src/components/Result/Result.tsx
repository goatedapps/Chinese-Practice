import { useEffect } from "react";
import { useAppState, useAppDispatch } from "../../state/AppStateContext";
import { saveHistory } from "../../state/history";
import { Sound } from "../../lib/sound";

export function Result() {
  const state = useAppState();
  const dispatch = useAppDispatch();

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
  // as the old renderResult()'s saveHistory() call.
  useEffect(() => {
    saveHistory({ date: Date.now(), modeLabel: state.modeLabel || "", totalItems, correctItems, skippedItems });
    if (totalItems > 0) {
      if (pct === 100) Sound.applause();
      else Sound.encourage();
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
      <div className="action-row">
        <button className="primary-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
          返回主页 Back to Home
        </button>
      </div>
    </div>
  );
}
