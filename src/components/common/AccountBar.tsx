import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { useAuth } from "../../state/AuthContext";
import { usePet } from "../../state/PetContext";
import { Icon } from "./Icons";

// The Login/Sign out affordance, split out of TopNav into its own small bar
// rendered just below it (see App.tsx) -- it's a state-dependent action, not
// a fixed screen destination, so it no longer competes for space with
// TopNav's 5 nav items. Also carries the BP stat pill (garden redesign) --
// this row is the natural "current status" slot, alongside account status.
// Signing out now flushes every pending local change to Supabase before the
// session actually ends (see state/AuthContext.tsx's signOut / lib/sync.ts's
// flushAllNow), so it's a real (if brief) network wait rather than instant --
// `signingOut` disables the button and swaps its label so a student can't
// double-tap it mid-flush.
export function AccountBar() {
  const dispatch = useAppDispatch();
  const { status, user, isGuest, signOut } = useAuth();
  const { pet } = usePet();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  }

  const bpPill = (
    <div className="top-nav-stat font-num">
      <Icon name="star" />
      {pet.bp.toLocaleString()} BP
    </div>
  );

  if (status === "signedIn" && user) {
    return (
      <div className="account-bar">
        {bpPill}
        <div className="account-chip">
          <span className="account-avatar">{user.username.slice(0, 1).toUpperCase()}</span>
          <span className="account-bar-status">@{user.username}</span>
          <button className="account-bar-btn" disabled={signingOut} onClick={() => void handleSignOut()}>
            {signingOut ? "保存中... Saving..." : "退出 Sign out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-bar">
      {bpPill}
      <div className="account-chip">
        <span className="account-avatar"><Icon name="paw" /></span>
        {isGuest && <span className="account-bar-status">访客模式 Guest mode</span>}
        <button className="account-bar-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "auth" })}>
          登录 Login
        </button>
      </div>
    </div>
  );
}
