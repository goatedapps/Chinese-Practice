import { useRef } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { SHOP_ITEMS, shopItemName, shopItemIconPath, GROWTH_ICON, HUNGER_ICON } from "../../data/pet";
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
              return (
                <div key={itemId} className="bag-item-card">
                  <div className="bag-item-emoji">
                    <img className="bag-item-icon" src={shopItemIconPath(item)} alt="" />
                    {qty > 1 && <span className="bag-item-qty-badge">×{qty}</span>}
                  </div>
                  <div className="bag-item-info">
                    <div className="bag-item-label">{shopItemName(item)}</div>
                  </div>
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

  function handleBuy() {
    if (!affordable) return;
    buyItem(item);
    Sound.purchase();
    if (cardRef.current && bagIconRef.current) {
      flyItemTo(cardRef.current, bagIconRef.current, shopItemIconPath(item), () => {});
    }
  }

  return (
    <div ref={cardRef} className={"shop-item-card" + (affordable ? "" : " shop-item-disabled")}>
      <div className="bag-item-row">
        <div className="bag-item-emoji">
          <img className="bag-item-icon" src={shopItemIconPath(item)} alt="" />
        </div>
        <div className="bag-item-info">
          <div className="bag-item-label">{shopItemName(item)}</div>
          <div className="bag-item-stat">
            <span className="stat-inline">
              <img className="stat-inline-icon" src={GROWTH_ICON} alt="" /> +{item.growth}
            </span>
            <span className="stat-inline">
              <img className="stat-inline-icon" src={HUNGER_ICON} alt="" /> {item.type === "toy" ? "最高 " : ""}+{item.mood}
            </span>
          </div>
        </div>
      </div>
      <button className="secondary-btn shop-item-buy" disabled={!affordable} onClick={handleBuy}>
        💡 {item.cost} BP
      </button>
    </div>
  );
}
