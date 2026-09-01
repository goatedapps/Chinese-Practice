import { useRef } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { SHOP_ITEMS, shopItemName, shopItemIconPath, GROWTH_ICON, HUNGER_ICON } from "../../data/pet";
import { Sound } from "../../lib/sound";
import { flyItemTo } from "../../lib/throwAnimation";
import { Icon } from "../common/Icons";
import type { ShopItem } from "../../data/types";

// Standard page-chrome (back-btn + page-header, see CLAUDE.md's Styling
// section) -- no subtitle/BP line of its own any more, since the top nav's
// AccountBar pill already shows current BP everywhere.
export function Shop() {
  const dispatch = useAppDispatch();

  return (
    <div className="screen shop-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
        <span className="back-btn-arrow">←</span>
        <span className="back-btn-label">返回</span>
      </button>
      <h1 className="page-header">
        <Icon name="sparkle" className="page-header-spark" />
        <img className="page-header-icon" src="/icons/shop.png" alt="" />
        商店 Shop
        <Icon name="sparkle" className="page-header-spark" />
      </h1>

      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => (
          <ShopItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// Each card flies its own purchased icon from itself to its own top-right
// "already own" badge (rather than to some page-level bag indicator, which
// no longer exists here) -- a self-contained animation that also visibly
// explains what the badge's count just changed to.
function ShopItemCard({ item }: { item: ShopItem }) {
  const { pet, buyItem } = usePet();
  const cardRef = useRef<HTMLDivElement>(null);
  const ownedRef = useRef<HTMLSpanElement>(null);
  const affordable = pet.bp >= item.cost;
  const owned = pet.inventory[item.id] ?? 0;

  function handleBuy() {
    if (!affordable) return;
    buyItem(item);
    Sound.purchase();
    if (cardRef.current && ownedRef.current) {
      flyItemTo(cardRef.current, ownedRef.current, shopItemIconPath(item), () => {});
    }
  }

  return (
    <div ref={cardRef} className={"shop-item-card" + (affordable ? "" : " shop-item-disabled")}>
      <span className="shop-item-owned" ref={ownedRef}>
        ×{owned}
      </span>
      <img className="shop-item-icon" src={shopItemIconPath(item)} alt="" />
      <div className="shop-item-label">{shopItemName(item)}</div>
      <div className="shop-item-stats">
        <span className="stat-inline">
          <img className="stat-inline-icon" src={GROWTH_ICON} alt="" /> +{item.growth}
        </span>
        <span className="stat-inline">
          <img className="stat-inline-icon" src={HUNGER_ICON} alt="" /> {item.type === "toy" ? "最高 " : ""}+{item.mood}
        </span>
      </div>
      <button className="primary-btn shop-item-buy" disabled={!affordable} onClick={handleBuy}>
        <img className="shop-item-buy-coin" src="/icons/coin.png" alt="" />
        {item.cost} BP
      </button>
    </div>
  );
}
