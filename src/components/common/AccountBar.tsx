import { useAppDispatch } from "../../state/AppStateContext";
import { useAuth } from "../../state/AuthContext";

// The Login/Sign out affordance, split out of TopNav into its own small bar
// rendered just below it (see App.tsx) -- it's a state-dependent action, not
// a fixed screen destination, so it no longer competes for space with
// TopNav's 5 nav items. Signing out never clears local progress, only stops
// future syncing (see state/AuthContext.tsx's signOut).
export function AccountBar() {
  const dispatch = useAppDispatch();
  const { status, user, isGuest, signOut } = useAuth();

  if (status === "signedIn" && user) {
    return (
      <div className="account-bar">
        <span className="account-bar-status">@{user.username}</span>
        <button className="account-bar-btn" onClick={() => void signOut()}>
          退出 Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="account-bar">
      {isGuest && <span className="account-bar-status">访客模式 Guest mode</span>}
      <button className="account-bar-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "auth" })}>
        登录 Login
      </button>
    </div>
  );
}
