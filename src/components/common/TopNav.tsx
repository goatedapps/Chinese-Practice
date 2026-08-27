import { useAppDispatch, useAppState, type Screen } from "../../state/AppStateContext";
import { Icon } from "./Icons";
import { ConfirmModal } from "./Modal";
import { useQuizLeaveGuard } from "../../lib/useQuizLeaveGuard";

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
  { key: "owl", label: "宠物", screens: ["owl", "shop", "bag", "play"], icon: "/icons/pet.png", isImage: true }
];

export function TopNav() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { guard, confirmOpen, confirm, cancel } = useQuizLeaveGuard();

  function go(key: string) {
    // Mid-quiz, confirm first (see useQuizLeaveGuard) -- otherwise navigate
    // straight away, matching every other "go home" affordance in the app
    // (Owl/Practice back buttons, Result's "Back to Home"), which clears any
    // stale quiz state while keeping the student's subject/category/lesson
    // picker selections.
    guard(() => {
      if (key === "home") dispatch({ type: "RESET_TO_HOME" });
      else dispatch({ type: "GO_TO_SCREEN", screen: key as Screen });
    });
  }

  function renderIcon(item: (typeof NAV_ITEMS)[number], className: string) {
    return item.isImage ? <img className={className} src={item.icon} alt="" /> : <Icon name={item.icon} className={className} />;
  }

  return (
    <>
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
              {renderIcon(item, "top-nav-item-icon")}
              <span className="top-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile-only bottom tab bar -- same NAV_ITEMS/go(), just a second
          rendering swapped in by CSS (see .bottom-nav's media query) once
          the top bar is too narrow to fit the brand + 5 nav items + BP +
          profile chip all in one row. Fixed to the viewport, not .top-bar,
          so it stays reachable even once the page scrolls. */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={"bottom-nav-item" + (item.screens.includes(state.screen) ? " bottom-nav-item-active" : "")}
            onClick={() => go(item.key)}
          >
            {renderIcon(item, "bottom-nav-item-icon")}
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {confirmOpen && (
        <ConfirmModal
          messageLines={[
            "确定要离开吗？本次练习尚未完成，本组进度将不会被保存。",
            "Are you sure? Your current progress will be lost."
          ]}
          onConfirm={confirm}
          onCancel={cancel}
        />
      )}
    </>
  );
}
