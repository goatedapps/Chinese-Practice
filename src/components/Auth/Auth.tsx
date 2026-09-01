import { useState, type FormEvent } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { useAuth } from "../../state/AuthContext";
import { usePet } from "../../state/PetContext";
import { PET_DEFAULT_STATE } from "../../data/pet";
import { clearLocalStore, clearSyncMeta, resetSyncState } from "../../lib/sync";
import { HISTORY_KEY } from "../../state/history";
import { ACHIEVEMENTS_KEY } from "../../state/achievements";
import { TINGXIE_PROGRESS_KEY } from "../../state/tingxieProgress";
import { LESSON_FREQUENCY_KEY } from "../../state/lessonFrequency";
import { LEVEL_KEY } from "../../state/levelPreference";
import { MY_VOCAB_KEY } from "../../state/myVocab";
import { DEFAULT_LEVEL, setCurrentLevel } from "../../data/levels";
import { Icon } from "../common/Icons";

// The owl panel's feature highlights -- purely informational (no click
// target), reusing the same Learn/Apply(~"Practice" here)/Play/Test
// copy Tingxie's own mode sidebar uses (see Tingxie.tsx's MODES) so the
// wording stays consistent between "what the app does" (here) and "what
// this button does" (there).
const AUTH_FEATURES = [
  { icon: "/icons/dictation-learn.png", title: "Learn", desc: "认识词语，打好基础" },
  { icon: "/icons/dictation-apply.png", title: "Practice", desc: "学以致用，巩固记忆" },
  { icon: "/icons/dictation-play.png", title: "Play", desc: "趣味挑战，快乐学习" },
  { icon: "/icons/dictation-test.png", title: "Test", desc: "检验成果，查漏补缺" }
];

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
    clearLocalStore(LESSON_FREQUENCY_KEY);
    clearLocalStore(LEVEL_KEY);
    clearLocalStore(MY_VOCAB_KEY);
    setCurrentLevel(DEFAULT_LEVEL);
    dispatch({ type: "SET_LEVEL", level: DEFAULT_LEVEL });
    // Also clear any leftover sync-meta timestamps (e.g. from local guest
    // play before this signup) -- same reasoning as SyncBootstrap.tsx's
    // sign-out cleanup, so a stale timestamp can never make a later merge
    // treat pre-signup local data as newer than this brand-new account's
    // (nonexistent) remote row. resetSyncState() clears the in-memory
    // counterpart (lib/sync.ts's pendingKeys/latestValues) for the same
    // reason -- a pending push queued during guest play must not get flushed
    // into this brand-new account's Supabase row once it signs in.
    clearSyncMeta();
    resetSyncState();
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
    <div className="auth-page">
      {/* Deliberately sits directly on the shared garden-scene page
          background, not inside .auth-screen's own card -- see that
          class's own comment in styles.css. */}
      <div className="auth-hero">
        <img className="auth-hero-logo" src="/icons/logo.png" alt="" />
        <div className="auth-hero-text">
          <h1 className="auth-hero-title">华文练习</h1>
          <p className="auth-hero-subtitle">快乐学习每一天</p>
        </div>
      </div>

      <div className="screen auth-screen">
        {!gated && (
          <button className="back-btn" onClick={goHome}>
            <span className="back-btn-arrow">←</span>
            <span className="back-btn-label">返回</span>
          </button>
        )}

        <div className="auth-panels">
          <div className="auth-panel auth-panel-main">
            <h2 className="auth-form-title">{mode === "signIn" ? "登录 Sign In" : "创建账号 Create Account"}</h2>
            <p className="auth-subtitle">Sign in to sync your progress across devices.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <div className="auth-input-wrap">
                  <img className="auth-input-icon" src="/icons/login-username.png" alt="" />
                  <input
                    className="auth-input"
                    type="text"
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_-]+"
                    autoComplete="username"
                    placeholder="Your username here"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </label>
              <label className="auth-field">
                <div className="auth-input-wrap">
                  <img className="auth-input-icon" src="/icons/login-password.png" alt="" />
                  <input
                    className="auth-input"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                    placeholder="Your password here"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
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
          </div>

          <div className="auth-panel-side">
            <img className="auth-owl-img" src="/icons/login-owl.png" alt="" />
            <div className="auth-feature-list">
              {AUTH_FEATURES.map((feature) => (
                <div className="auth-feature-row" key={feature.title}>
                  <img className="auth-feature-icon" src={feature.icon} alt="" />
                  <div className="auth-feature-text">
                    <div className="auth-feature-title">{feature.title}</div>
                    <div className="auth-feature-desc">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="button" className="auth-guest-card" onClick={handleContinueAsGuest}>
          <span className="auth-guest-icon">
            <Icon name="paw" />
          </span>
          <span className="auth-guest-body">
            <span className="auth-guest-title">Continue as Guest</span>
            <span className="auth-guest-text">
              Skip login for now and use the app as a guest. Your progress is saved only on this device and won't
              sync across devices.
            </span>
          </span>
          <Icon name="chevron" className="auth-guest-chevron" />
        </button>
      </div>
    </div>
  );
}
