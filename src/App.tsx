import { useEffect, type ReactNode } from "react";
import { AppStateProvider, useAppState } from "./state/AppStateContext";
import { PetProvider } from "./state/PetContext";
import { Sound } from "./lib/sound";
import { Home } from "./components/Home/Home";
import { Practice } from "./components/Practice/Practice";
import { Quiz } from "./components/Quiz/Quiz";
import { Result } from "./components/Result/Result";
import { Owl } from "./components/Owl/Owl";
import { Shop } from "./components/Shop/Shop";
import { Bag } from "./components/Bag/Bag";
import { Tingxie } from "./components/Tingxie/Tingxie";
import { TopNav } from "./components/common/TopNav";

function ScreenRouter() {
  const state = useAppState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.screen]);

  // Hidden mid-quiz/on the result screen -- Quiz already has its own Home
  // button with a "leave without saving?" confirmation, and a second
  // always-visible way out would either bypass that or duplicate it.
  const showTopNav = state.screen !== "quiz" && state.screen !== "result";

  let screen: ReactNode;
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
    case "tingxie":
      screen = <Tingxie />;
      break;
    default:
      // Auth lands here until its own component exists.
      screen = (
        <div className="screen">
          <p>敬请期待 Coming soon...</p>
        </div>
      );
  }

  return (
    <>
      {showTopNav && <TopNav />}
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
    <AppStateProvider>
      <PetProvider>
        <ScreenRouter />
      </PetProvider>
    </AppStateProvider>
  );
}
