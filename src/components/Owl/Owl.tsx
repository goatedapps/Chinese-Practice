import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage, nextStage } from "../../state/PetContext";
import { OwlArt } from "../common/OwlArt";

const MOOD_LABELS: Record<string, string> = {
  sad: "心情低落 Sad",
  neutral: "心情平静 Neutral",
  happy: "心情满足 Happy",
  very_happy: "心情开心 Very Happy"
};

export function Owl() {
  const dispatch = useAppDispatch();
  const { pet, renameOwl } = usePet();
  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const next = nextStage(pet.growth);
  const bucket = moodBucket(mood);
  const pct = next ? Math.round(((pet.growth - stage.minGrowth) / (next.minGrowth - stage.minGrowth)) * 100) : 100;
  const bagCount = Object.values(pet.inventory).reduce((sum, n) => sum + n, 0);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(pet.name);

  function startEditingName() {
    setNameInput(pet.name);
    setEditingName(true);
  }

  function saveName() {
    renameOwl(nameInput);
    setEditingName(false);
  }

  return (
    <div className="screen owl-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        ← 返回 Back
      </button>
      {editingName ? (
        <div className="owl-name-row owl-name-editing">
          <input
            className="owl-name-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={12}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName();
              if (e.key === "Escape") setEditingName(false);
            }}
          />
          <button className="owl-name-save" title="保存 Save" onClick={saveName}>
            ✓
          </button>
          <button className="owl-name-cancel" title="取消 Cancel" onClick={() => setEditingName(false)}>
            ✕
          </button>
        </div>
      ) : (
        <h1 className="owl-name-row owl-name-heading">
          {pet.name || "为它取个名字吧 Give it a name"}
          <button className="owl-name-edit" title="改名 Rename" onClick={startEditingName}>
            ✏️
          </button>
        </h1>
      )}

      <OwlArt stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-large" playSound />
      <div className="owl-info">
        <div className="owl-stage-label">{stage.label}</div>
        <div className="owl-mood-label">{MOOD_LABELS[bucket]}</div>
        <div className="growth-bar">
          <div className="growth-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="growth-caption">{next ? `${pet.growth}/${next.minGrowth}` : "已完全长大 Fully grown!"}</div>
        <div className="owl-bp-label">💡 可用 BP: {pet.bp}</div>
      </div>
      <div className="action-row">
        <button className="primary-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "shop" })}>
          🛍 商店 Shop
        </button>
        <button className="secondary-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "bag" })}>
          🍚 喂食 Feed{bagCount ? ` (${bagCount})` : ""}
        </button>
      </div>
    </div>
  );
}
