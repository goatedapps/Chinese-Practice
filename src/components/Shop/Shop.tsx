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
  const bagEntries = Object.entries(pet.inventory).filter(([, qty]) => qty > 0);
  const bagCount = bagEntries.reduce((sum, [, qty]) => sum + qty, 0);

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

      {bagEntries.length > 0 && (
        <>
          <h2>道具袋 My Bag</h2>
          <div className="bag-grid">
            {bagEntries.map(([itemId, qty]) => {
              const item = SHOP_ITEMS.find((i) => i.id === itemId);
              if (!item) return null;
              const emoji = item.label.split(" ")[0];
              const label = item.label.slice(emoji.length).trim();
              return (
                <div key={itemId} className="bag-item-card">
                  <div className="bag-item-emoji">{emoji}</div>
                  <div className="bag-item-label">{label}</div>
                  <div className="bag-item-qty">x{qty}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2>购买道具 Items for Sale</h2>
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
      <div className="shop-item-stats">{`🌱 成长 +${item.growth}　🍚 饱食度 +${item.mood}`}</div>
      <button className="secondary-btn shop-item-buy" disabled={!affordable} onClick={handleBuy}>
        💡 {item.cost} BP
      </button>
    </div>
  );
}
