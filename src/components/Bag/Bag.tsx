import { useRef, useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage } from "../../state/PetContext";
import { SHOP_ITEMS } from "../../data/pet";
import { Sound } from "../../lib/sound";
import { flyItemTo } from "../../lib/throwAnimation";
import { OwlArt } from "../common/OwlArt";
import { PetStatBars } from "../common/PetStatBars";
import type { ShopItem } from "../../data/types";

export function Bag() {
  const dispatch = useAppDispatch();
  const { pet, giveItem } = usePet();
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
      <h1>{`喂食 Feed ${pet.name || "它"}`}</h1>
      <OwlArt ref={owlRef} stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-large" playSound />
      {ageUpAge !== null && (
        <div className="age-up-banner" role="status">
          🎉 {pet.name || "它"}长大了一岁，现在是 {ageUpAge} 岁了！
          <br />
          Your pet has grown wiser — now {ageUpAge} years old!
        </div>
      )}
      <PetStatBars pet={pet} />
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
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface BagItemCardProps {
  item: ShopItem;
  qty: number;
  owlRef: React.RefObject<HTMLDivElement | null>;
  onGive: (item: ShopItem) => { agedUp: boolean; age: number };
  onAgedUp: (age: number) => void;
}

function BagItemCard({ item, qty, owlRef, onGive, onAgedUp }: BagItemCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [giving, setGiving] = useState(false);
  const emoji = item.label.split(" ")[0];
  const label = item.label.slice(emoji.length).trim();

  function handleClick() {
    if (giving || !cardRef.current || !owlRef.current) return;
    setGiving(true);
    flyItemTo(cardRef.current, owlRef.current, emoji, () => {
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
    <div className="bag-item-card" ref={cardRef}>
      <div className="bag-item-emoji">{emoji}</div>
      <div className="bag-item-label">{label}</div>
      <div className="bag-item-qty">x{qty}</div>
      <div className="shop-item-stats">{`🌱 成长 +${item.growth}　🍚 饱食度 +${item.mood}`}</div>
      <button className="secondary-btn bag-item-give" disabled={giving} onClick={handleClick}>
        🎁 送给它 Give
      </button>
    </div>
  );
}
