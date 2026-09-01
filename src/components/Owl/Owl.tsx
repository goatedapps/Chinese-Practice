import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getAge, getStage } from "../../state/PetContext";
import { OwlArt } from "../common/OwlArt";
import { PetStatBars } from "../common/PetStatBars";
import { Icon } from "../common/Icons";
import { Sound } from "../../lib/sound";

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
        <span className="back-btn-arrow">←</span>
        <span className="back-btn-label">返回</span>
      </button>
      <h1 className="page-header">
        <Icon name="sparkle" className="page-header-spark" />
        <img className="page-header-icon" src="/icons/pet.png" alt="" />
        我的宠物 My Pet
        <Icon name="sparkle" className="page-header-spark" />
      </h1>
      <div className="pet-layout pet-layout-wide">
        <div className="pet-profile-card">
          <div className="pet-layout-art owl-large-xl-wrap">
            <OwlArt stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-large" playSound />
          </div>
          {editingName ? (
            <div className="owl-name-row owl-name-editing owl-name-pill">
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
            <h1 className="owl-name-row owl-name-heading owl-name-pill">
              {pet.name || "为它取个名字吧 Give it a name"}
              <button className="owl-name-edit" title="改名 Rename" onClick={startEditingName}>
                ✏️
              </button>
            </h1>
          )}
          <div className="pet-profile-meta">
            <span className="pet-profile-age">{age}岁 {age} yrs old</span>
            <span className="pet-profile-stage-badge">{stage.label}</span>
          </div>
        </div>

        <div className="pet-layout-info pet-layout-info-wide">
          <div className="owl-info">
            <PetStatBars pet={pet} />
          </div>

          <div className="owl-action-banner-row">
            <button
              className="owl-action-banner owl-action-banner-shop"
              onClick={() => {
                Sound.enterShop();
                dispatch({ type: "GO_TO_SCREEN", screen: "shop" });
              }}
            >
              <img src="/icons/shop.png" alt="" />
              <span className="owl-action-banner-label">商店</span>
            </button>
            <button
              className="owl-action-banner owl-action-banner-play"
              onClick={() => {
                Sound.bagOpen();
                dispatch({ type: "GO_TO_SCREEN", screen: "bag" });
              }}
            >
              <img src="/icons/play.png" alt="" />
              <span className="owl-action-banner-label">喂食／玩耍{bagCount ? ` (${bagCount})` : ""}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
