import { useEffect } from "react";
import { AppStateProvider, useAppState } from "./state/AppStateContext";
import { PetProvider } from "./state/PetContext";
import { Sound } from "./lib/sound";
import { Home } from "./components/Home/Home";
import { LessonPicker } from "./components/LessonPicker/LessonPicker";
import { TypePicker } from "./components/TypePicker/TypePicker";
import { Quiz } from "./components/Quiz/Quiz";
import { Result } from "./components/Result/Result";
import { Owl } from "./components/Owl/Owl";
import { Shop } from "./components/Shop/Shop";
import { Bag } from "./components/Bag/Bag";
import { Tingxie } from "./components/Tingxie/Tingxie";

function ScreenRouter() {
  const state = useAppState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.screen]);

  switch (state.screen) {
    case "home":
      return <Home />;
    case "lessonPicker":
      return <LessonPicker />;
    case "typePicker":
      return <TypePicker />;
    case "quiz":
      return <Quiz />;
    case "result":
      return <Result />;
    case "owl":
      return <Owl />;
    case "shop":
      return <Shop />;
    case "bag":
      return <Bag />;
    case "tingxie":
      return <Tingxie />;
    default:
      // Auth lands here until its own component exists.
      return (
        <div className="screen">
          <p>敬请期待 Coming soon...</p>
        </div>
      );
  }
}

export default function App() {
  useEffect(() => {
    // Play a click sound for any button-like element pressed anywhere in the app.
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("button, .option-label, .tingxie-flip-card")) Sound.click();
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <AppStateProvider>
      <PetProvider>
        <ScreenRouter />
      </PetProvider>
    </AppStateProvider>
  );
}
