import { useEffect } from "react";
import { AppStateProvider, useAppState } from "./state/AppStateContext";
import { PetProvider } from "./state/PetContext";
import { Sound } from "./lib/sound";
import { Home } from "./components/Home/Home";
import { LessonPicker } from "./components/LessonPicker/LessonPicker";
import { TypePicker } from "./components/TypePicker/TypePicker";

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
    default:
      // Quiz/Result/Owl/Shop/Auth land here until their own components exist.
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
      if (target.closest("button, .option-label")) Sound.click();
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
