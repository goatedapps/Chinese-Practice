import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getAge, getStage } from "../../state/PetContext";
import { OwlArt } from "../common/OwlArt";
import { PetStatBars } from "../common/PetStatBars";
import { Sound } from "../../lib/sound";

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
  const age = getAge(pet.growth);
  const stage = getStage(pet.growth);
  const bucket = moodBucket(mood);
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

      <div className="pet-layout">
        <div className="pet-layout-art">
          <OwlArt stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-large" playSound />
        </div>
        <div className="pet-layout-info">
          <div className="owl-info">
            <div className="owl-stage-label">{stage.label} · 🎂 {age}岁 {age} yrs old</div>
            <div className="owl-mood-label">{MOOD_LABELS[bucket]}</div>
            <PetStatBars pet={pet} />
            <div className="owl-bp-label">💡 可用 BP: {pet.bp}</div>
          </div>
          <div className="action-row">
            <button
              className="primary-btn"
              onClick={() => {
                Sound.enterShop();
                dispatch({ type: "GO_TO_SCREEN", screen: "shop" });
              }}
            >
              🛍 商店 Shop
            </button>
            <button
              className="secondary-btn"
              onClick={() => {
                Sound.bagOpen();
                dispatch({ type: "GO_TO_SCREEN", screen: "bag" });
              }}
            >
              🍚 喂食／玩耍 Feed / Play{bagCount ? ` (${bagCount})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
