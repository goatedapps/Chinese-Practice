import { useRef, useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage } from "../../state/PetContext";
import { SHOP_ITEMS, shopItemName, shopItemIconPath, GROWTH_ICON, HUNGER_ICON } from "../../data/pet";
import { Sound } from "../../lib/sound";
import { flyItemTo } from "../../lib/throwAnimation";
import { OwlArt } from "../common/OwlArt";
import { PetStatBars } from "../common/PetStatBars";
import type { ShopItem } from "../../data/types";

export function Bag() {
  const dispatch = useAppDispatch();
  const { pet, giveItem, consumeItem } = usePet();
  const owlRef = useRef<HTMLDivElement>(null);
  // Stays visible for as long as the student is on this screen -- cleared
  // only by navigating away (component unmount), not on a timer.
  const [ageUpAge, setAgeUpAge] = useState<number | null>(null);

  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const bucket = moodBucket(mood);
  const entries = Object.entries(pet.inventory).filter(([, qty]) => qty > 0);

  return (
    <div className="screen bag-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
        ← 返回 Back
      </button>
      <h1>{`喂食／玩耍 Feed / Play with ${pet.name || "它"}`}</h1>
      <div className="pet-layout pet-layout-wide">
        <div className="pet-layout-art">
          <OwlArt ref={owlRef} stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-large" playSound />
          {ageUpAge !== null && (
            <div className="age-up-banner" role="status">
              🎉 {pet.name || "它"}长大了一岁，现在是 {ageUpAge} 岁了！
              <br />
              Your pet has grown wiser. {pet.name || "Your pet"} is now {ageUpAge} year{ageUpAge === 1 ? "" : "s"} old.
            </div>
          )}
          <PetStatBars pet={pet} />
        </div>
        <div className="pet-layout-info pet-layout-info-wide">
          <h2>道具袋 My Bag</h2>

          {entries.length === 0 ? (
            <div className="bag-empty">
              <p className="subtitle">道具袋是空的 Your bag is empty</p>
              <div className="owl-bp-label">💡 可用 BP: {pet.bp}</div>
              <div className="action-row">
                <button
                  className="primary-btn"
                  onClick={() => {
                    Sound.enterShop();
                    dispatch({ type: "GO_TO_SCREEN", screen: "shop" });
                  }}
                >
                  🛍 前往商店 Visit Shop
                </button>
              </div>
            </div>
          ) : (
            <div className="bag-grid">
              {entries.map(([itemId, qty]) => {
                const item = SHOP_ITEMS.find((i) => i.id === itemId);
                if (!item) return null;
                return (
                  <BagItemCard
                    key={itemId}
                    item={item}
                    qty={qty}
                    owlRef={owlRef}
                    onGive={giveItem}
                    onAgedUp={setAgeUpAge}
                    onPlay={(toy) => {
                      consumeItem(toy);
                      dispatch({ type: "START_PLAY", itemId: toy.id });
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BagItemCardProps {
  item: ShopItem;
  qty: number;
  owlRef: React.RefObject<HTMLDivElement | null>;
  onGive: (item: ShopItem) => { agedUp: boolean; age: number };
  onAgedUp: (age: number) => void;
  onPlay: (item: ShopItem) => void;
}

// The card itself is the tap target (no separate "Give"/"Play" button inside
// it) -- tapping anywhere on a food card throws it at the owl and feeds it;
// tapping a toy card starts its minigame immediately. Kept deliberately
// terse: image + Chinese name + one stat line, no English text and no
// "tap to ..." hint -- the tap affordance comes from the card itself being a
// button (cursor/press states via .bag-item-card-tappable), not a label.
function BagItemCard({ item, qty, owlRef, onGive, onAgedUp, onPlay }: BagItemCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [giving, setGiving] = useState(false);
  const isToy = item.type === "toy";

  function handleClick() {
    if (isToy) {
      onPlay(item);
      return;
    }
    if (giving || !cardRef.current || !owlRef.current) return;
    setGiving(true);
    flyItemTo(cardRef.current, owlRef.current, shopItemIconPath(item), () => {
      const result = onGive(item);
      if (result.agedUp) {
        Sound.levelUp();
        onAgedUp(result.age);
      } else {
        Sound.gift();
      }
      setGiving(false);
    });
  }

  return (
    <button
      className="bag-item-card bag-item-card-tappable"
      ref={cardRef}
      disabled={!isToy && giving}
      onClick={handleClick}
    >
      <div className="bag-item-emoji">
        <img className="bag-item-icon" src={shopItemIconPath(item)} alt="" />
        {qty > 1 && <span className="bag-item-qty-badge">×{qty}</span>}
      </div>
      <div className="bag-item-info">
        <div className="bag-item-label">{shopItemName(item)}</div>
        <div className="bag-item-stat">
          {isToy ? (
            <span className="stat-inline">
              <img className="stat-inline-icon" src={HUNGER_ICON} alt="" /> 饱食度最高 +{item.mood}
            </span>
          ) : (
            <>
              <span className="stat-inline">
                <img className="stat-inline-icon" src={GROWTH_ICON} alt="" /> 成长 +{item.growth}
              </span>
              <span className="stat-inline">
                <img className="stat-inline-icon" src={HUNGER_ICON} alt="" /> 饱食度 +{item.mood}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
