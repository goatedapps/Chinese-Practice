import { assetUrl } from "../../lib/assets";
import { useEffect } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { stopSpeaking } from "../../lib/speech";
import { TingxieProvider, useTingxieState, useTingxieDispatch, type TingxieView } from "./tingxieState";
import { BilingualLabel } from "../common/BilingualLabel";
import { CurrentLevel } from "../common/CurrentLevel";
import { LessonSelect } from "./LessonSelect";
import { Learn } from "./Learn";
import { Apply } from "./Apply";
import { Play } from "./Play";
import { Practice } from "./Practice";

const MODES: { view: Exclude<TingxieView, "select">; icon: string; zh: string; en: string }[] = [
  { view: "learn", icon: assetUrl("/icons/dictation-learn.webp"), zh: "学习", en: "Learn" },
  { view: "apply", icon: assetUrl("/icons/dictation-apply.webp"), zh: "应用", en: "Apply" },
  { view: "play", icon: assetUrl("/icons/dictation-play.webp"), zh: "游戏", en: "Play" },
  { view: "practice", icon: assetUrl("/icons/dictation-test.webp"), zh: "测试", en: "Test" }
];

function TingxieShell() {
  const appDispatch = useAppDispatch();
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  const inActivity = state.view !== "select" && !!state.activeContent;

  useEffect(() => {
    stopSpeaking();
    return stopSpeaking;
  }, [state.view, state.subTab, state.activeContent]);

  function handleBack() {
    if (inActivity) dispatch({ type: "GO_SELECT" });
    else appDispatch({ type: "GO_TO_SCREEN", screen: "home" });
  }

  const backButton = (
    <button className="back-btn" onClick={handleBack}>
      <span className="back-btn-arrow">←</span>
      <span className="back-btn-label">返回</span>
    </button>
  );

  if (!inActivity || !state.activeContent) {
    return (
      <div className="screen tingxie-screen">
        <div className="tingxie-topbar">{backButton}</div>
        <LessonSelect />
      </div>
    );
  }

  return (
    <div className={"screen tingxie-screen tingxie-screen-activity" + (state.view === "learn" ? " tingxie-screen-activity-learn" : "")}>
      <div className="tingxie-activity-layout">
        <aside className="tingxie-mode-sidebar">
          {backButton}
          <nav className="tingxie-mode-list" aria-label="听写模式 Dictation modes">
            {MODES.filter((mode) => !state.activeContent!.isCustomReview || mode.view !== "learn").map((mode) => (
              <button
                key={mode.view}
                className={"tingxie-mode-card" + (state.view === mode.view ? " tingxie-mode-card-active" : "")}
                aria-pressed={state.view === mode.view}
                onClick={() => dispatch({ type: "SET_VIEW", view: mode.view })}
              >
                <img className="tingxie-mode-icon" src={mode.icon} alt="" />
                <BilingualLabel zh={mode.zh} en={mode.en} />
              </button>
            ))}
          </nav>
        </aside>

        <div className="tingxie-activity-content">
          <div className="tingxie-activity-header">
            <div className="tingxie-activity-title">
              <img src={assetUrl("/icons/dictatation-mission.webp")} alt="" />
              <span className="tingxie-activity-title-text">{state.activeContent.title}</span>
              <CurrentLevel />
            </div>
            {state.activeContent.vocabFilterMode !== "all" && (
              <span className="tingxie-my-vocab-badge">{state.activeContent.vocabFilterMode === "myVocabOnly" ? "我的词库 My Vocab" : "自选词语"}</span>
            )}
          </div>
          {state.view === "learn" && state.activeContent.sentences.length > 0 && (
            <div className="tingxie-learn-tabs" role="group" aria-label="学习内容 Learn content">
              <button className="chip" aria-pressed={state.subTab === "vocab"} onClick={() => dispatch({ type: "SET_SUB_TAB", tab: "vocab" })}>词语 Vocab</button>
              <button className="chip" aria-pressed={state.subTab === "sentence"} onClick={() => dispatch({ type: "SET_SUB_TAB", tab: "sentence" })}>句子 Sentences</button>
            </div>
          )}
          {state.view === "learn" && <Learn />}
          {state.view === "apply" && <Apply />}
          {state.view === "play" && <Play />}
          {state.view === "practice" && <Practice />}
        </div>
      </div>
    </div>
  );
}

export function Tingxie() {
  return <TingxieProvider><TingxieShell /></TingxieProvider>;
}
