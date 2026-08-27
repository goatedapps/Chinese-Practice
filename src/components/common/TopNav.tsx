import { useAppDispatch, useAppState, type Screen } from "../../state/AppStateContext";
import { Icon } from "./Icons";

// Persistent top nav shown on every screen except Quiz/Result -- an
// in-progress quiz already has its own Home button with a "leave without
// saving?" confirmation, and a second always-visible way out would either
// bypass that confirmation or duplicate it. App.tsx is what decides not to
// render this on those two screens.
//
// icon is either an inline-SVG glyph name (see common/Icons.tsx, for the two
// nav items with no matching illustrated asset) or a real PNG path (reusing
// the same icons already used elsewhere for these activities).
const NAV_ITEMS: { key: string; label: string; screens: Screen[]; icon: string; isImage?: boolean }[] = [
  { key: "home", label: "主页", screens: ["home"], icon: "home" },
  { key: "tingxie", label: "听写", screens: ["tingxie"], icon: "/icons/dictation.png", isImage: true },
  { key: "practice", label: "练习", screens: ["practice"], icon: "/icons/practice.png", isImage: true },
  { key: "story", label: "故事", screens: ["story"], icon: "/icons/read.png", isImage: true },
  // Shop/Bag/Play are reached from the Owl screen and conceptually part of
  // the same "pet" flow, so this stays highlighted on all four.
  { key: "owl", label: "宠物", screens: ["owl", "shop", "bag", "play"], icon: "paw" }
];

export function TopNav() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  function go(key: string) {
    // Matches every other "go home" affordance in the app (Owl/Practice back
    // buttons, Result's "Back to Home") -- clears any stale quiz state while
    // keeping the student's subject/category/lesson picker selections.
    if (key === "home") dispatch({ type: "RESET_TO_HOME" });
    else dispatch({ type: "GO_TO_SCREEN", screen: key as Screen });
  }

  return (
    <div className="top-nav-row">
      <div className="top-nav-brand">
        <div className="top-nav-brand-badge"><img src="/icons/pet.png" alt="" /></div>
        <div className="top-nav-brand-text">
          <div className="top-nav-brand-title">华文练习</div>
        </div>
      </div>

      <nav className="top-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={"top-nav-item" + (item.screens.includes(state.screen) ? " top-nav-item-active" : "")}
            onClick={() => go(item.key)}
          >
            {item.isImage ? <img className="top-nav-item-icon" src={item.icon} alt="" /> : <Icon name={item.icon} className="top-nav-item-icon" />}
            <span className="top-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
