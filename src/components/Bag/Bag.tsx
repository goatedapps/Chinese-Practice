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
        <span className="back-btn-arrow">←</span>
        <span className="back-btn-label">返回 Back</span>
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
              <div className="action-row">
                {/* Same button as the Owl page's own Shop banner (see
                    Owl.tsx), reused here rather than a bespoke primary-btn,
                    so "go buy something" looks identical everywhere it's
                    offered. */}
                <button
                  className="owl-action-banner owl-action-banner-shop"
                  onClick={() => {
                    Sound.enterShop();
                    dispatch({ type: "GO_TO_SCREEN", screen: "shop" });
                  }}
                >
                  <img src="/icons/shop.png" alt="" />
                  <span className="owl-action-banner-label">商店 Shop</span>
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
// tapping a toy card starts its minigame immediately. Visual layout matches
// Shop.tsx's own item cards (icon on top, label + stat row below, an "owned"
// count badge in the top-right corner) -- .bag-item-card-tappable is just
// the button-reset/press-state modifier layered on top of that shared
// .shop-item-card look, same as it already layered on the old horizontal
// .bag-item-card look.
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
      className="shop-item-card bag-item-card-tappable"
      ref={cardRef}
      disabled={!isToy && giving}
      onClick={handleClick}
    >
      <span className="shop-item-owned">×{qty}</span>
      <img className="shop-item-icon" src={shopItemIconPath(item)} alt="" />
      <div className="shop-item-label">{shopItemName(item)}</div>
      <div className="shop-item-stats">
        <span className="stat-inline">
          <img className="stat-inline-icon" src={GROWTH_ICON} alt="" /> +{item.growth}
        </span>
        <span className="stat-inline">
          <img className="stat-inline-icon" src={HUNGER_ICON} alt="" /> {isToy ? "最高 " : ""}+{item.mood}
        </span>
      </div>
    </button>
  );
}
