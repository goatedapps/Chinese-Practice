import { useAppDispatch, useAppState, type Screen } from "../../state/AppStateContext";
import { useAuth } from "../../state/AuthContext";

// Persistent top nav shown on every screen except Quiz/Result -- an
// in-progress quiz already has its own Home button with a "leave without
// saving?" confirmation (see Quiz.tsx), and a second always-visible way out
// would either bypass that confirmation or duplicate it. App.tsx is what
// decides not to render this on those two screens.
const NAV_ITEMS: { key: string; label: string; screens: Screen[] }[] = [
  { key: "home", label: "主页", screens: ["home"] },
  { key: "tingxie", label: "听写练习", screens: ["tingxie"] },
  { key: "practice", label: "练习", screens: ["practice"] },
  { key: "story", label: "读故事", screens: ["story"] },
  // Shop/Bag/Play are reached from the Owl screen and conceptually part of
  // the same "pet" flow, so this stays highlighted on all four.
  { key: "owl", label: "宠物", screens: ["owl", "shop", "bag", "play"] }
];

export function TopNav() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { status, user, signOut } = useAuth();

  function go(key: string) {
    // Matches every other "go home" affordance in the app (Owl/Practice back
    // buttons, Result's "Back to Home") -- clears any stale quiz state while
    // keeping the student's subject/category/lesson picker selections.
    if (key === "home") dispatch({ type: "RESET_TO_HOME" });
    else dispatch({ type: "GO_TO_SCREEN", screen: key as Screen });
  }

  return (
    <nav className="top-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          className={"top-nav-item" + (item.screens.includes(state.screen) ? " top-nav-item-active" : "")}
          onClick={() => go(item.key)}
        >
          <span className="top-nav-label">{item.label}</span>
        </button>
      ))}
      {/* Account affordance -- not a NAV_ITEMS entry above since it's
          state-dependent (signed in/out) rather than a fixed screen
          destination. Signing out never clears local progress, only stops
          future syncing (see state/AuthContext.tsx's signOut). */}
      {status === "signedIn" && user ? (
        <button className="top-nav-item top-nav-account" onClick={() => void signOut()} title={`@${user.username}`}>
          <span className="top-nav-label">退出 Sign out</span>
        </button>
      ) : (
        <button className="top-nav-item top-nav-account" onClick={() => go("auth")}>
          <span className="top-nav-label">登录 Login</span>
        </button>
      )}
    </nav>
  );
}
