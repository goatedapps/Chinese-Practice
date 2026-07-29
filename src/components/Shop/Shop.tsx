import { useRef } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { SHOP_ITEMS } from "../../data/pet";
import { Sound } from "../../lib/sound";
import { flyItemTo } from "../../lib/throwAnimation";
import type { ShopItem } from "../../data/types";

export function Shop() {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const bagIconRef = useRef<HTMLSpanElement>(null);
  const bagCount = Object.values(pet.inventory).reduce((sum, n) => sum + n, 0);

  return (
    <div className="screen shop-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
        ← 返回 Back
      </button>
      <h1>商店 Shop</h1>
      <p className="subtitle">
        💡 可用 BP: {pet.bp}　·　购买后道具会放入道具袋 Purchases go into your Bag{" "}
        <span className="shop-bag-indicator" ref={bagIconRef}>
          🎒 {bagCount}
        </span>
      </p>
      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => (
          <ShopItemCard key={item.id} item={item} bagIconRef={bagIconRef} />
        ))}
      </div>
    </div>
  );
}

interface ShopItemCardProps {
  item: ShopItem;
  bagIconRef: React.RefObject<HTMLSpanElement | null>;
}

function ShopItemCard({ item, bagIconRef }: ShopItemCardProps) {
  const { pet, buyItem } = usePet();
  const cardRef = useRef<HTMLDivElement>(null);
  const affordable = pet.bp >= item.cost;
  const emoji = item.label.split(" ")[0];

  function handleBuy() {
    if (!affordable) return;
    buyItem(item);
    Sound.purchase();
    if (cardRef.current && bagIconRef.current) {
      flyItemTo(cardRef.current, bagIconRef.current, emoji, () => {});
    }
  }

  return (
    <div ref={cardRef} className={"shop-item-card" + (affordable ? "" : " shop-item-disabled")}>
      <div className="shop-item-label">{item.label}</div>
      <div className="shop-item-stats">{`成长 +${item.growth}　心情 +${item.mood}`}</div>
      <button className="secondary-btn shop-item-buy" disabled={!affordable} onClick={handleBuy}>
        💡 {item.cost} BP
      </button>
    </div>
  );
}
