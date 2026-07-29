import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage } from "../../state/PetContext";
import { owlSpritePath } from "../../data/pet";
import { loadHistory } from "../../state/history";

const MOOD_LABELS: Record<string, string> = {
  sad: "心情低落 Sad",
  neutral: "心情平静 Neutral",
  happy: "心情满足 Happy",
  very_happy: "心情开心 Very Happy"
};

export function Home() {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const hist = loadHistory();
  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const bucket = moodBucket(mood);

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
          <h2>最近记录 Recent Sessions</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>日期 Date</th>
                <th>模式 Mode</th>
                <th>得分 Score</th>
              </tr>
            </thead>
            <tbody>
              {hist.slice(0, 8).map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.date).toLocaleString()}</td>
                  <td>{h.modeLabel}</td>
                  <td>
                    {h.correctItems}/{h.totalItems}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
