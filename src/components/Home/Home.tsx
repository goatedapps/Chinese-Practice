import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage } from "../../state/PetContext";
import { owlSpritePath } from "../../data/pet";
import { loadHistory, clearAllHistory, deleteHistoryEntry } from "../../state/history";
import { ConfirmModal } from "../common/Modal";

const MOOD_LABELS: Record<string, string> = {
  sad: "心情低落 Sad",
  neutral: "心情平静 Neutral",
  happy: "心情满足 Happy",
  very_happy: "心情开心 Very Happy"
};

type PendingHistoryAction = { type: "clear" } | { type: "delete"; id: string };

export function Home() {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const [hist, setHist] = useState(() => loadHistory());
  const [pending, setPending] = useState<PendingHistoryAction | null>(null);
  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const bucket = moodBucket(mood);

  function handleConfirm() {
    if (!pending) return;
    if (pending.type === "clear") clearAllHistory();
    else deleteHistoryEntry(pending.id);
    setHist(loadHistory());
    setPending(null);
  }

  return (
    <div className="screen home">
      <h1>华文练习 Chinese Practice</h1>
      <p className="subtitle">选择一种练习方式 Choose how you'd like to practice</p>

      <button className="pet-status-strip" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
        <div className={`owl-art owl-stage-${stage.key} owl-thumb`}>
          <img src={owlSpritePath(stage.key, bucket)} alt="" />
        </div>
        <div className="pet-status-text">
          <div className="pet-status-stage">{stage.label}</div>
          <div className="pet-status-mood">{MOOD_LABELS[bucket]}</div>
        </div>
        <div className="pet-status-bp">💡 {pet.bp} BP</div>
      </button>

      <div className="mode-cards">
        <button className="mode-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "lessonPicker" })}>
          <div className="mode-card-title">📘 按课文练习</div>
          <div className="mode-card-sub">Practice by Lesson</div>
          <div className="mode-card-desc">选择正在学习的课，练习该课的语文应用题目。</div>
        </button>
        <button className="mode-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "typePicker" })}>
          <div className="mode-card-title">🧩 按题型练习</div>
          <div className="mode-card-sub">Practice by Question Type</div>
          <div className="mode-card-desc">选择题型，如完形填空、阅读理解、汉语拼音等，不分课别。</div>
        </button>
      </div>

      {hist.length > 0 && (
        <div className="history">
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
                  <td>
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
