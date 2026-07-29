import { useRef, useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage } from "../../state/PetContext";
import { owlSpritePath, SHOP_ITEMS } from "../../data/pet";
import { Sound } from "../../lib/sound";
import { throwToOwl } from "../../lib/throwAnimation";
import type { ShopItem } from "../../data/types";

export function Bag() {
  const dispatch = useAppDispatch();
  const { pet, giveItem } = usePet();
  const owlRef = useRef<HTMLDivElement>(null);

  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const bucket = moodBucket(mood);
  const entries = Object.entries(pet.inventory).filter(([, qty]) => qty > 0);

  return (
    <div className="screen bag-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
        ← 返回 Back
      </button>
      <h1>道具袋 My Bag</h1>
      <div ref={owlRef} className={`owl-art owl-stage-${stage.key} owl-large`}>
        <img src={owlSpritePath(stage.key, bucket)} alt={stage.label} />
      </div>

      {entries.length === 0 ? (
        <p className="subtitle">道具袋是空的，去商店买些东西吧！Your bag is empty — visit the Shop first.</p>
      ) : (
        <div className="bag-grid">
          {entries.map(([itemId, qty]) => {
            const item = SHOP_ITEMS.find((i) => i.id === itemId);
            if (!item) return null;
            return <BagItemCard key={itemId} item={item} qty={qty} owlRef={owlRef} onGive={giveItem} />;
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
  onGive: (item: ShopItem) => void;
}

function BagItemCard({ item, qty, owlRef, onGive }: BagItemCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [giving, setGiving] = useState(false);
  const emoji = item.label.split(" ")[0];
  const label = item.label.slice(emoji.length).trim();

  function handleClick() {
    if (giving || !cardRef.current || !owlRef.current) return;
    setGiving(true);
    throwToOwl(cardRef.current, owlRef.current, emoji, () => {
      onGive(item);
      Sound.ding(0);
      setGiving(false);
    });
  }

  return (
    <div className="bag-item-card" ref={cardRef}>
      <div className="bag-item-emoji">{emoji}</div>
      <div className="bag-item-label">{label}</div>
      <div className="bag-item-qty">x{qty}</div>
      <button className="secondary-btn bag-item-give" disabled={giving} onClick={handleClick}>
        🎁 送给它 Give
      </button>
    </div>
  );
}
