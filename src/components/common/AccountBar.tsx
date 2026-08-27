import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { useAuth } from "../../state/AuthContext";
import { usePet } from "../../state/PetContext";
import { LEVELS } from "../../data/levels";
import { Icon } from "./Icons";
import { LevelBar } from "./LevelBar";
import { ConfirmModal } from "./Modal";
import { useQuizLeaveGuard } from "../../lib/useQuizLeaveGuard";

// The rightmost slot of the top bar: the BP stat pill, plus a single
// "Profile" trigger (avatar + name) that opens a dropdown holding both the
// Login/Sign out action and a nested Level pullout (LevelBar.tsx itself is
// unchanged -- still the one place that calls setCurrentLevel()+dispatches
// SET_LEVEL together, see data/levels.ts -- only where/how it's rendered
// changed). Closes on an outside click or Escape, same as any other
// lightweight menu.
export function AccountBar() {
  const dispatch = useAppDispatch();
  const { status, user, isGuest, signOut } = useAuth();
  const { pet } = usePet();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { guard, confirmOpen, confirm, cancel } = useQuizLeaveGuard();

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeMenu();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    setLevelOpen(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    closeMenu();
  }

  const signedIn = status === "signedIn" && user;
  const displayName = signedIn ? `@${user.username}` : isGuest ? "访客 Guest" : "未登录 Guest";

  return (
    <div className="account-bar">
      <div className="top-nav-stat font-num">
        <img className="top-nav-stat-coin" src="/icons/coin.png" alt="" />
        {pet.bp.toLocaleString()} BP
      </div>

      <div className="account-menu" ref={rootRef}>
        <button className="account-chip" onClick={() => setMenuOpen((open) => !open)}>
          <span className="account-avatar">{signedIn ? user.username.slice(0, 1).toUpperCase() : <Icon name="paw" />}</span>
          <span className="account-bar-status">{displayName}</span>
          <Icon name="chevron" className={"account-menu-caret" + (menuOpen ? " account-menu-caret-open" : "")} />
        </button>

        {menuOpen && (
          <div className="account-dropdown">
            {LEVELS.length > 1 && (
              <>
                <button className="account-dropdown-item" onClick={() => setLevelOpen((open) => !open)}>
                  <span>年级 Level</span>
                  <Icon name="chevron" className={"account-dropdown-caret" + (levelOpen ? " account-dropdown-caret-open" : "")} />
                </button>
                {levelOpen && (
                  <div className="account-dropdown-pullout">
                    <LevelBar />
                  </div>
                )}
                <div className="account-dropdown-divider" />
              </>
            )}
            {signedIn ? (
              <button className="account-dropdown-item" disabled={signingOut} onClick={() => void handleSignOut()}>
                {signingOut ? "保存中... Saving..." : "退出 Sign out"}
              </button>
            ) : (
              <button
                className="account-dropdown-item"
                onClick={() => {
                  closeMenu();
                  guard(() => dispatch({ type: "GO_TO_SCREEN", screen: "auth" }));
                }}
              >
                登录 Login
              </button>
            )}
          </div>
        )}
      </div>

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
    </div>
  );
}
