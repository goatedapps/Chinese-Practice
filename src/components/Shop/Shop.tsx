import { useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { SHOP_ITEMS } from "../../data/pet";

export function Shop() {
  const dispatch = useAppDispatch();
  const { pet, buyItem } = usePet();

  return (
    <div className="screen shop-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
        ← 返回 Back
      </button>
      <h1>商店 Shop</h1>
      <p className="subtitle">💡 可用 BP: {pet.bp}　·　购买后道具会放入道具袋 Purchases go into your Bag</p>
      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => {
          const affordable = pet.bp >= item.cost;
          return (
            <div key={item.id} className={"shop-item-card" + (affordable ? "" : " shop-item-disabled")}>
              <div className="shop-item-label">{item.label}</div>
              <div className="shop-item-stats">{`成长 +${item.growth}　心情 +${item.mood}`}</div>
              <button
                className="secondary-btn shop-item-buy"
                disabled={!affordable}
                onClick={() => {
                  if (affordable) buyItem(item);
                }}
              >
                💡 {item.cost} BP
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
