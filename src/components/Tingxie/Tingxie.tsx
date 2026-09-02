import { useEffect, useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { stopSpeaking } from "../../lib/speech";
import { TingxieProvider, useTingxieState, useTingxieDispatch, type TingxieView } from "./tingxieState";
import { Icon } from "../common/Icons";
import { LessonSelect } from "./LessonSelect";
import { Learn } from "./Learn";
import { Apply } from "./Apply";
import { Play } from "./Play";
import { Practice } from "./Practice";

// Learn isn't in this list -- it renders as its own taller sidebar card
// (icon/title row plus the vocab/sentence sub-tab toggle inline below,
// see tingxie-mode-card-tall) instead of the plain single-row button the
// other three modes use.
const MODES: { view: Exclude<TingxieView, "select" | "learn">; icon: string; title: string; colorClass: string }[] = [
  { view: "apply", icon: "/icons/dictation-apply.png", title: "应用模式 Apply", colorClass: "tingxie-mode-apply" },
  { view: "play", icon: "/icons/dictation-play.png", title: "游戏模式 Play", colorClass: "tingxie-mode-play" },
  { view: "practice", icon: "/icons/dictation-test.png", title: "测试模式 Test", colorClass: "tingxie-mode-test" }
];

function TingxieShell() {
  const appDispatch = useAppDispatch();
  const state = useTingxieState();
  const dispatch = useTingxieDispatch();
  // Mobile-only: the mode sidebar is off-canvas by default there (see
  // .tingxie-mode-sidebar's media query) and slides in as an overlay when
  // this is true -- purely ephemeral UI state, not worth lifting into the
  // shared reducer.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const inActivity = state.view === "learn" || state.view === "apply" || state.view === "play" || state.view === "practice";

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

  function goToMode(view: Exclude<TingxieView, "select">) {
    dispatch({ type: "SET_VIEW", view });
    setSidebarOpen(false);
  }

  // The "select" (LessonSelect) screen keeps the plain single-bar layout it
  // always had -- LessonSelect shows its own big centered title, so this
  // bar only needs the back button. Once a lesson (or custom review pool)
  // is chosen, the mode tabs move into their own left sidebar instead (see
  // .tingxie-activity-layout below), matching the approved mockup.
  if (!inActivity || !state.activeContent) {
    return (
      <div className="screen tingxie-screen">
        <div className="tingxie-topbar">
          <button className="back-btn" onClick={handleBack}>
            <span className="back-btn-arrow">←</span>
            <span className="back-btn-label">返回</span>
          </button>
        </div>
        <LessonSelect />
      </div>
    );
  }

  return (
    <div className={"screen tingxie-screen tingxie-screen-activity" + (state.view === "learn" ? " tingxie-screen-activity-learn" : "")}>
      <div className="tingxie-activity-layout">
        {/* Mobile only (see .tingxie-sidebar-backdrop's media query) --
            dims the content and closes the sidebar on tap, the standard
            off-canvas-drawer pattern. */}
        {sidebarOpen && <div className="tingxie-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

        <aside className={"tingxie-mode-sidebar" + (sidebarOpen ? " tingxie-mode-sidebar-open" : "")}>
          <button className="back-btn" onClick={handleBack}>
            <span className="back-btn-arrow">←</span>
            <span className="back-btn-label">返回</span>
          </button>
          <h2 className="tingxie-mode-heading">
            <Icon name="sparkle" className="tingxie-mode-heading-spark" />
            选择听写模式 Choose Mode
            <Icon name="sparkle" className="tingxie-mode-heading-spark" />
          </h2>
          <div className="tingxie-mode-list">
            {/* Learn's tall card: a plain header row (own <button>, since
                the sub-tab toggle below needs real <button>s too and a
                <button> can't nest other buttons) plus the vocab/sentence
                toggle inline underneath -- forced to exactly double the
                other cards' height via flex-grow (see .tingxie-mode-card-tall).
                Unavailable during custom review (no single lesson to attach
                Learn's BP to), same as before. */}
            {!state.activeContent?.isCustomReview && (
              <div className={"tingxie-mode-card tingxie-mode-learn tingxie-mode-card-tall" + (state.view === "learn" ? " tingxie-mode-card-active" : "")}>
                <button className="tingxie-mode-card-main" onClick={() => goToMode("learn")}>
                  <span className="tingxie-mode-icon"><img src="/icons/dictation-learn.png" alt="" /></span>
                  <span className="tingxie-mode-text">
                    <span className="tingxie-mode-title">学习模式 Learn</span>
                  </span>
                  <Icon name="chevron" className="tingxie-mode-chevron" />
                </button>
                <div className="tingxie-mode-card-subtabs">
                  <button
                    className={"tingxie-mode-card-subtab" + (state.subTab === "vocab" ? " tingxie-mode-card-subtab-active" : "")}
                    onClick={() => {
                      dispatch({ type: "SET_SUB_TAB", tab: "vocab" });
                      goToMode("learn");
                    }}
                  >
                    词语 Vocab
                  </button>
                  {/* Hidden whenever this content has no sentences at all --
                      always true in My Vocab Only mode (saved words carry no
                      sentence data, so content-loading forces sentences to
                      []), and true in Select Vocab mode whenever the student
                      didn't check any sentence in the picker. */}
                  {(state.activeContent?.sentences.length ?? 0) > 0 && (
                    <button
                      className={"tingxie-mode-card-subtab" + (state.subTab === "sentence" ? " tingxie-mode-card-subtab-active" : "")}
                      onClick={() => {
                        dispatch({ type: "SET_SUB_TAB", tab: "sentence" });
                        goToMode("learn");
                      }}
                    >
                      句子 Sentences
                    </button>
                  )}
                </div>
              </div>
            )}
            {MODES.map((mode) => (
              <button
                key={mode.view}
                className={"tingxie-mode-card " + mode.colorClass + (state.view === mode.view ? " tingxie-mode-card-active" : "")}
                onClick={() => goToMode(mode.view)}
              >
                <span className="tingxie-mode-icon"><img src={mode.icon} alt="" /></span>
                <span className="tingxie-mode-text">
                  <span className="tingxie-mode-title">{mode.title}</span>
                </span>
                <Icon name="chevron" className="tingxie-mode-chevron" />
              </button>
            ))}
          </div>
        </aside>

        <div className="tingxie-activity-content">
          <div className="tingxie-activity-header">
            {/* Hidden on desktop (the sidebar is always visible there) --
                see .tingxie-mode-toggle-btn's media query. */}
            <button className="tingxie-mode-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <Icon name="chevron" className="tingxie-mode-toggle-icon" />
              切换模式 Modes
            </button>
            <div className="tingxie-activity-title">
              <img src="/icons/dictatation-mission.png" alt="" />
              <span className="tingxie-activity-title-text">{state.activeContent.title}</span>
              {state.activeContent.vocabFilterMode === "myVocabOnly" && (
                <span className="tingxie-my-vocab-badge">我的词库 My Vocab</span>
              )}
              {state.activeContent.vocabFilterMode === "selected" && (
                <span className="tingxie-my-vocab-badge tingxie-my-vocab-badge-selected">自选词语</span>
              )}
            </div>
          </div>

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
  return (
    <TingxieProvider>
      <TingxieShell />
    </TingxieProvider>
  );
}
