import { useState, type FormEvent } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { useAuth } from "../../state/AuthContext";
import { usePet } from "../../state/PetContext";
import { PET_DEFAULT_STATE } from "../../data/pet";
import { clearLocalStore } from "../../lib/sync";
import { HISTORY_KEY } from "../../state/history";
import { ACHIEVEMENTS_KEY } from "../../state/achievements";
import { TINGXIE_PROGRESS_KEY } from "../../state/tingxieProgress";

// The "auth" screen -- entirely optional (see the Back link below), reached
// via TopNav's account button (signed out) or GO_TO_SCREEN "auth". Login
// itself does nothing beyond authenticating; state/SyncBootstrap.tsx picks
// up the resulting signed-in status and reconciles local/remote data in the
// background once this screen has already navigated away.
export function Auth() {
  const dispatch = useAppDispatch();
  const { signIn, signUp } = useAuth();
  const { replacePetState } = usePet();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function goHome() {
    dispatch({ type: "RESET_TO_HOME" });
  }

  // A brand-new account should never inherit whatever's sitting in this
  // browser's localStorage -- device-local play before ever logging in, or
  // leftover data from a previous account/testing session -- as if it were
  // this account's progress. Resets every synced store to its default
  // *before* SyncBootstrap's post-sign-in merge ever runs, so that merge
  // finds nothing local to (wrongly) upload for this new user. The pet
  // store needs the live-React-state route (replacePetState, same one
  // state/SyncBootstrap.tsx uses for a remote pull) since it's held in
  // PetContext, not just read lazily on mount like the other three.
  function startFresh() {
    replacePetState({ ...PET_DEFAULT_STATE, lastFedAt: Date.now() });
    clearLocalStore(HISTORY_KEY);
    clearLocalStore(ACHIEVEMENTS_KEY);
    clearLocalStore(TINGXIE_PROGRESS_KEY);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = mode === "signIn" ? await signIn(username, password) : await signUp(username, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "signUp") startFresh();
    goHome();
  }

  return (
    <div className="screen auth-screen">
      <button className="back-btn" onClick={goHome}>
        ← 返回 Back
      </button>
      <h1 className="auth-title">{mode === "signIn" ? "登录 Sign In" : "注册 Create Account"}</h1>
      <p className="auth-subtitle">登录后，你的进度可以在多台设备间同步。 Sign in to sync your progress across devices.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>用户名 Username</span>
          <input
            className="auth-input"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_-]+"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="auth-field">
          <span>密码 Password</span>
          <input
            className="auth-input"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="primary-btn auth-submit" type="submit" disabled={submitting}>
          {submitting ? "请稍候... Please wait..." : mode === "signIn" ? "登录 Sign In" : "注册 Create Account"}
        </button>
      </form>

      <button
        className="auth-toggle"
        onClick={() => {
          setError(null);
          setMode(mode === "signIn" ? "signUp" : "signIn");
        }}
      >
        {mode === "signIn" ? "还没有账号？注册 No account? Create one" : "已有账号？登录 Have an account? Sign in"}
      </button>
    </div>
  );
}
