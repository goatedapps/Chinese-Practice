import { useEffect } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { stopSpeaking } from "../../lib/speech";
import { TingxieProvider, useTingxieState, useTingxieDispatch } from "./tingxieState";
import { LessonSelect } from "./LessonSelect";
import { TingxiePicker } from "./TingxiePicker";
import { Learn } from "./Learn";
import { Apply } from "./Apply";
import { Play } from "./Play";
import { Practice } from "./Practice";

function TingxieShell() {
  const appDispatch = useAppDispatch();
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();

  const inActivity = state.view === "learn" || state.view === "apply" || state.view === "play" || state.view === "practice";
  const showTabs = inActivity && state.activeContent !== null;

  // Stop any in-progress "🔊 朗读 Listen" reading whenever the student
  // switches view/tab/lesson, or leaves Tingxie mode entirely (unmount) --
  // same lingering-speech bug as Quiz.tsx's dictation button, fixed the
  // same way here for every one of Tingxie's speakText() call sites at once.
  useEffect(() => {
    stopSpeaking();
    return stopSpeaking;
  }, [state.view, state.subTab, state.activeContent]);

  function handleBack() {
    if (inActivity) dispatch({ type: "GO_SELECT" });
    else appDispatch({ type: "GO_TO_SCREEN", screen: "home" });
  }

  return (
    <div className="screen tingxie-screen">
      <div className="tingxie-topbar">
        <button className="back-btn" onClick={handleBack}>
          <span className="back-btn-arrow">←</span>
          <span className="back-btn-label">返回 Back</span>
        </button>
        {/* LessonSelect (the "select" view) already shows its own big
            centered title -- a second one here would just duplicate it. */}
        {state.view !== "select" && (
          <div className="tingxie-topbar-title">
            <img src="/icons/dictatation-mission.png" alt="" />
            {state.activeContent?.title ?? "听写练习 Dictation Practice"}
          </div>
        )}
      </div>

      {showTabs && (
        <div className="tingxie-tabs">
          {!state.activeContent?.isCustomReview && (
            <button className={"tingxie-tab" + (state.view === "learn" ? " tingxie-tab-active" : "")} onClick={() => dispatch({ type: "SET_VIEW", view: "learn" })}>
              📖 学习 Learn
            </button>
          )}
          <button className={"tingxie-tab" + (state.view === "apply" ? " tingxie-tab-active" : "")} onClick={() => dispatch({ type: "SET_VIEW", view: "apply" })}>
            ✏️ 词语应用 Apply
          </button>
          <button className={"tingxie-tab" + (state.view === "play" ? " tingxie-tab-active" : "")} onClick={() => dispatch({ type: "SET_VIEW", view: "play" })}>
            ☁️ 词云游戏 Play
          </button>
          <button className={"tingxie-tab" + (state.view === "practice" ? " tingxie-tab-active" : "")} onClick={() => dispatch({ type: "SET_VIEW", view: "practice" })}>
            🔊 听写测试 Test
          </button>
        </div>
      )}

      {state.view === "select" && <LessonSelect />}
      {state.view === "picker" && <TingxiePicker />}
      {state.view === "learn" && state.activeContent && <Learn />}
      {state.view === "apply" && state.activeContent && <Apply />}
      {state.view === "play" && state.activeContent && <Play />}
      {state.view === "practice" && state.activeContent && <Practice />}
    </div>
  );
}

export function Tingxie() {
  return (
    <TingxieProvider>
      <TingxieShell />
    </TingxieProvider>
  );
}
