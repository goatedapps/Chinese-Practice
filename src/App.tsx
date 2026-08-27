import { useEffect, useState, type ReactNode } from "react";
import { AppStateProvider, useAppState, useAppDispatch } from "./state/AppStateContext";
import { PetProvider } from "./state/PetContext";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { SyncBootstrap } from "./state/SyncBootstrap";
import { fetchQuestionMeta, fetchQuestionIndex, computeCategorySubjects, prefetchAllQuestionCategories } from "./data/questions";
import { Sound } from "./lib/sound";
import { Home } from "./components/Home/Home";
import { Practice } from "./components/Practice/Practice";
import { Quiz } from "./components/Quiz/Quiz";
import { Result } from "./components/Result/Result";
import { Owl } from "./components/Owl/Owl";
import { Shop } from "./components/Shop/Shop";
import { Bag } from "./components/Bag/Bag";
import { PlayGame } from "./components/Play/PlayGame";
import { Tingxie } from "./components/Tingxie/Tingxie";
import { Story } from "./components/Story/Story";
import { Auth } from "./components/Auth/Auth";
import { TopNav } from "./components/common/TopNav";
import { AccountBar } from "./components/common/AccountBar";
import { CursorGlow } from "./components/common/CursorGlow";
import { OwlFlyover } from "./components/common/OwlFlyover";
import { IconSprite } from "./components/common/Icons";

function ScreenRouter() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { status, isGuest } = useAuth();
  const [bootError, setBootError] = useState<string | null>(null);

  function loadQuestionIndex() {
    setBootError(null);
    Promise.all([fetchQuestionMeta(), fetchQuestionIndex()])
      .then(([meta, index]) => {
        dispatch({ type: "SET_QUESTION_INDEX", index, categorySubjects: computeCategorySubjects(index), lessonCount: meta.lessonCount });
        // Non-blocking: warms every category's full content in the
        // background so Practice.tsx's "Start Practice" doesn't have to pay
        // a fresh network round trip per category later, on a real hosted
        // connection where that's a noticeable delay (unlike localhost).
        prefetchAllQuestionCategories();
      })
      .catch((err: Error) => setBootError(err.message));
  }

  // Runs once at app start (RESET_TO_HOME preserves questionIndexLoaded, so
  // this never refires just from navigating home) -- gates the whole screen
  // render below until the question-bank index is in state, since
  // AppStateContext's SELECT_SUBJECT reducer case needs categorySubjects
  // synchronously and reducers can't await a fetch themselves.
  useEffect(() => {
    if (state.questionIndexLoaded) return;
    loadQuestionIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.questionIndexLoaded]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.screen]);

  // Also waits on auth `status` leaving "loading" (not just the question
  // index) -- otherwise a signed-in student would flash the forced login
  // gate below for an instant before their session is confirmed.
  if (!state.questionIndexLoaded || status === "loading") {
    return (
      <div className="screen">
        {bootError ? (
          <div className="tingxie-error">
            <p>{bootError}</p>
            <button className="secondary-btn" onClick={loadQuestionIndex}>
              重试 Retry
            </button>
          </div>
        ) : (
          <p className="tingxie-loading">加载中... Loading...</p>
        )}
      </div>
    );
  }

  // Forced login gate: a student who isn't signed in and hasn't explicitly
  // chosen to continue as a guest (Auth.tsx's "Continue as Guest", which
  // persists via AuthContext's isGuest) always lands on the login page
  // first, instead of state.screen's normal destination. This is a pure
  // computed check, not a dispatched navigation -- it can't be bypassed by a
  // stale screen value, and clears itself the instant continueAsGuest()/a
  // real sign-in resolves with no extra dispatch needed.
  const needsAuthGate = status !== "signedIn" && !isGuest;

  // Hidden mid-quiz/on the result screen -- Quiz already has its own Home
  // button with a "leave without saving?" confirmation, and a second
  // always-visible way out would either bypass that or duplicate it. Also
  // hidden while the login gate is forcing the Auth screen, since there's
  // nowhere else in the app to navigate to yet.
  const showTopNav = !needsAuthGate && state.screen !== "quiz" && state.screen !== "result";
  // The Login/Sign out affordance lives here, not as a TopNav item -- paired
  // with TopNav's own visibility, but also hidden on the Auth screen itself
  // (no point offering "Login" while already on the login page).
  const showAccountBar = showTopNav && state.screen !== "auth";

  let screen: ReactNode;
  if (needsAuthGate) {
    screen = <Auth gated />;
  } else {
    switch (state.screen) {
      case "home":
        screen = <Home />;
        break;
      case "practice":
        screen = <Practice />;
        break;
      case "quiz":
        screen = <Quiz />;
        break;
      case "result":
        screen = <Result />;
        break;
      case "owl":
        screen = <Owl />;
        break;
      case "shop":
        screen = <Shop />;
        break;
      case "bag":
        screen = <Bag />;
        break;
      case "play":
        screen = <PlayGame />;
        break;
      case "tingxie":
        screen = <Tingxie />;
        break;
      case "story":
        screen = <Story />;
        break;
      case "auth":
        screen = <Auth />;
        break;
      default:
        screen = (
          <div className="screen">
            <p>敬请期待 Coming soon...</p>
          </div>
        );
    }
  }

  return (
    <>
      {/* One merged navy bar (TopNav's nav pills + AccountBar's BP stat and
          profile menu) -- each stays its own component/hook boundary, but
          visually reads as a single top bar (see .top-bar in styles.css).
          The P2/P5 level toggle now lives inside AccountBar's profile
          dropdown (LevelBar.tsx itself, just rendered as a nested pullout
          there instead of its own bar item) -- see AccountBar.tsx.
          AccountBar still conditionally omits itself on the Auth screen. */}
      {showTopNav && (
        <div className="top-bar">
          <TopNav />
          {showAccountBar && <AccountBar />}
        </div>
      )}
      {screen}
    </>
  );
}

export default function App() {
  useEffect(() => {
    // Play a click sound for any button-like element pressed anywhere in the app.
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("button, .option-label, .tingxie-flip-card")) Sound.click();
      // Browsers only allow unmuted audio to autoplay after a genuine user
      // gesture, so the looping background track can't just start on mount.
      // startBackgroundMusic() is idempotent (no-ops once actually playing),
      // so it's safe to call on every click for the whole page session --
      // this is what lets it recover if the very first click's gesture
      // wasn't accepted for some reason.
      Sound.startBackgroundMusic();
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    // Pause the background track while the tab is hidden/backgrounded (tab
    // switch, minimize, switching to another app) and resume it when the
    // student comes back -- otherwise it keeps looping in a tab nobody's
    // looking at.
    function handleVisibilityChange() {
      if (document.hidden) Sound.pauseBackgroundMusic();
      else Sound.startBackgroundMusic();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    // AuthProvider sits outermost -- it doesn't depend on AppStateContext or
    // PetContext, and PetProvider's initial state loads synchronously from
    // localStorage (see state/PetContext.tsx's loadPetState), so nothing
    // below it could await a remote pull before first paint anyway. Merge
    // always happens as a background reconciliation after mount, via
    // SyncBootstrap, never a render-blocking one -- see
    // state/SyncBootstrap.tsx.
    <AuthProvider>
      <AppStateProvider>
        <PetProvider>
          <SyncBootstrap />
          <IconSprite />
          <CursorGlow />
          <OwlFlyover />
          <ScreenRouter />
        </PetProvider>
      </AppStateProvider>
    </AuthProvider>
  );
}
