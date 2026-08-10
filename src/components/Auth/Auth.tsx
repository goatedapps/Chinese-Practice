import { useState, type FormEvent } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { useAuth } from "../../state/AuthContext";
import { usePet } from "../../state/PetContext";
import { PET_DEFAULT_STATE } from "../../data/pet";
import { clearLocalStore } from "../../lib/sync";
import { HISTORY_KEY } from "../../state/history";
import { ACHIEVEMENTS_KEY } from "../../state/achievements";
import { TINGXIE_PROGRESS_KEY } from "../../state/tingxieProgress";

// The "auth" screen -- reached via AccountBar's Login button, GO_TO_SCREEN
// "auth", or (when `gated`) forced by App.tsx's ScreenRouter for a student
// who isn't signed in and hasn't chosen guest mode yet. Login itself does
// nothing beyond authenticating; state/SyncBootstrap.tsx picks up the
// resulting signed-in status and reconciles local/remote data in the
// background once this screen has already navigated away. Skipping login
// (see the Guest section below) is always available, gated or not, so this
// is never a genuine dead end -- just a required first choice.
export function Auth({ gated = false }: { gated?: boolean }) {
  const dispatch = useAppDispatch();
  const { signIn, signUp, continueAsGuest } = useAuth();
  const { replacePetState } = usePet();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function goHome() {
    dispatch({ type: "RESET_TO_HOME" });
  }

  // continueAsGuest() flips AuthContext's isGuest to true, which is what
  // actually clears App.tsx's forced login gate -- the RESET_TO_HOME dispatch
  // here just makes sure a non-gated visit (e.g. a signed-out student who
  // navigated here manually) also lands back on Home afterward, matching the
  // sign-in/sign-up success path below.
  function handleContinueAsGuest() {
    continueAsGuest();
    goHome();
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
      {!gated && (
        <button className="back-btn" onClick={goHome}>
          ← Back
        </button>
      )}
      <h1 className="auth-title">{mode === "signIn" ? "Sign In" : "Create Account"}</h1>
      <p className="auth-subtitle">Sign in to sync your progress across devices.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Username</span>
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
          <span>Password</span>
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
          {submitting ? "Please wait..." : mode === "signIn" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <button
        className="auth-toggle"
        onClick={() => {
          setError(null);
          setMode(mode === "signIn" ? "signUp" : "signIn");
        }}
      >
        {mode === "signIn" ? "No account? Create one" : "Have an account? Sign in"}
      </button>

      <div className="auth-guest">
        <p className="auth-guest-text">
          Or skip login for now and use the app as a guest. In guest mode, your progress is saved only on this
          device and won't sync across devices.
        </p>
        <button className="secondary-btn auth-guest-btn" onClick={handleContinueAsGuest}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
