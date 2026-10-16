import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { AppStateProvider, useAppState, useAppDispatch } from "./state/AppStateContext";
import { PetProvider } from "./state/PetContext";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { SyncBootstrap } from "./state/SyncBootstrap";
import { fetchQuestionMeta, fetchQuestionIndex, computeCategorySubjects } from "./data/questions";
import { getCurrentLevel } from "./data/levels";
import { Sound } from "./lib/sound";
import { Home } from "./components/Home/Home";
import { Auth } from "./components/Auth/Auth";
import { TopNav } from "./components/common/TopNav";
import { AccountBar } from "./components/common/AccountBar";
import { CursorGlow } from "./components/common/CursorGlow";
import { IconSprite } from "./components/common/Icons";
import { ScreenBoundary } from "./components/common/ScreenBoundary";

const Practice = lazy(() => import("./components/Practice/Practice").then((module) => ({ default: module.Practice })));
const Quiz = lazy(() => import("./components/Quiz/Quiz").then((module) => ({ default: module.Quiz })));
const Result = lazy(() => import("./components/Result/Result").then((module) => ({ default: module.Result })));
const Owl = lazy(() => import("./components/Owl/Owl").then((module) => ({ default: module.Owl })));
const Shop = lazy(() => import("./components/Shop/Shop").then((module) => ({ default: module.Shop })));
const Bag = lazy(() => import("./components/Bag/Bag").then((module) => ({ default: module.Bag })));
const PlayGame = lazy(() => import("./components/Play/PlayGame").then((module) => ({ default: module.PlayGame })));
const Tingxie = lazy(() => import("./components/Tingxie/Tingxie").then((module) => ({ default: module.Tingxie })));
const Story = lazy(() => import("./components/Story/Story").then((module) => ({ default: module.Story })));
const MyVocab = lazy(() => import("./components/MyVocab/MyVocab").then((module) => ({ default: module.MyVocab })));

function ScreenRouter() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { status, isGuest } = useAuth();
  const [bootError, setBootError] = useState<string | null>(null);

  function loadQuestionIndex() {
    setBootError(null);
    // Captured now, checked again once the fetch resolves -- a signed-in
    // student's cross-device level sync (SyncBootstrap.tsx's onLevelRow) can
    // call setCurrentLevel()+SET_LEVEL shortly after this fetch already
    // started (which re-fires this same effect for the corrected level), so
    // without this guard a slower, now-stale response could still land last
    // and silently overwrite the correct level's data.
    const requestedLevel = getCurrentLevel();
    Promise.all([fetchQuestionMeta(), fetchQuestionIndex()])
      .then(([meta, index]) => {
        if (getCurrentLevel() !== requestedLevel) return;
        dispatch({ type: "SET_QUESTION_INDEX", index, categorySubjects: computeCategorySubjects(index), lessonCount: meta.lessonCount });
      })
      .catch((err: Error) => {
        if (getCurrentLevel() === requestedLevel) setBootError(err.message);
      });
  }

  // Home and Auth render immediately; Practice waits for the lightweight index.
  useEffect(() => {
    if (state.questionIndexLoaded || status === "loading" || (status !== "signedIn" && !isGuest)) return;
    loadQuestionIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.questionIndexLoaded, state.level, status, isGuest]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.screen]);

  // Resolve the saved login before choosing between Auth and the local dashboard.
  const needsAuthGate = status !== "signedIn" && !isGuest;
  const needsQuestionIndex = state.screen === "practice" && !needsAuthGate;
  if ((needsQuestionIndex && !state.questionIndexLoaded) || status === "loading") {
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

  // Mid-quiz navigation uses the shared leave guard; completed results have their own Home action.
  const showTopNav = state.screen !== "result";
  // The Login/Sign out affordance lives here, not as a TopNav item -- paired
  // with TopNav's own visibility, but also hidden on the Auth screen itself
  // (no point offering "Login" while already on the login page) and while
  // the login gate is forcing Auth regardless of state.screen's real value.
  const showAccountBar = showTopNav && !needsAuthGate && state.screen !== "auth";

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
      case "myVocab":
        screen = <MyVocab />;
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
      {showTopNav && (
        <div className="top-bar">
          <TopNav />
          {showAccountBar && <AccountBar />}
        </div>
      )}
      <ScreenBoundary key={state.screen}>
        <Suspense fallback={<div className="screen"><p className="tingxie-loading">加载中... Loading...</p></div>}>
          {screen}
        </Suspense>
      </ScreenBoundary>
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
          <ScreenRouter />
        </PetProvider>
      </AppStateProvider>
    </AuthProvider>
  );
}
