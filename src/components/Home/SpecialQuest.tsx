import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { SPECIAL_QUEST_TYPES } from "../../data/pet";
import { VOCABULARY_CATEGORY_KEYS, fetchQuestionCategory } from "../../data/questions";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { getTodaySpecialQuest, spinSpecialQuest } from "../../state/specialQuest";
import { Sound } from "../../lib/sound";

// How long the wheel's CSS spin transition runs (see .quest-wheel-dial in
// styles.css) -- the "spinning" UI stays up for exactly this long before
// switching to the assigned-quest card, same "JS timer matches CSS
// transition duration" pattern as Story.tsx's page-flip animation.
const SPIN_MS = 2600;
const SEGMENT_DEG = 360 / SPECIAL_QUEST_TYPES.length;

function isIconPath(icon: string): boolean {
  return icon.startsWith("/");
}

function QuestIcon({ icon, className }: { icon: string; className?: string }) {
  return isIconPath(icon) ? (
    <img className={className} src={icon} alt="" />
  ) : (
    <span className={className}>{icon}</span>
  );
}

// Home dashboard's "Special Quest" wheel -- once a day, spinning assigns one
// of SPECIAL_QUEST_TYPES at random (see state/specialQuest.ts for the
// day-scoped persistence). Completion itself is detected elsewhere (the
// hooks in PetContext.tsx/PlayGame.tsx/Result.tsx) -- this component only
// spins, displays the assigned quest, and routes "Do Quest" to wherever that
// quest is actually completed.
export function SpecialQuest() {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const [quest, setQuest] = useState(() => getTodaySpecialQuest());
  const [spinning, setSpinning] = useState(false);
  const [dialRotation, setDialRotation] = useState(0);
  const [starting, setStarting] = useState(false);

  function handleSpin() {
    if (spinning || quest) return;
    const questId = spinSpecialQuest();
    const idx = SPECIAL_QUEST_TYPES.findIndex((q) => q.id === questId);
    // Land the pointer (fixed at the top / 0deg) on the middle of the chosen
    // segment: a conic-gradient segment i spans [i*SEGMENT_DEG, (i+1)*SEGMENT_DEG)
    // clockwise from the top, so its middle is i*SEGMENT_DEG + SEGMENT_DEG/2,
    // and rotating the dial clockwise by (360 - middle) brings that middle to
    // the top. A few extra full turns (spins) just make the animation read as
    // a real spin rather than a short snap to the target angle -- this only
    // ever runs once per mount (the wheel UI is replaced once `quest` is set,
    // so dialRotation's starting value is always 0), so no need to account
    // for a previous rotation here.
    const spins = 4;
    const targetMiddle = idx * SEGMENT_DEG + SEGMENT_DEG / 2;
    setDialRotation(spins * 360 + (360 - targetMiddle));
    setSpinning(true);
    Sound.wheelSpin();
    window.setTimeout(() => {
      setSpinning(false);
      setQuest({ questId, status: "pending" });
    }, SPIN_MS);
  }

  async function doQuest() {
    if (!quest || starting) return;
    if (quest.questId === "vocab100" || quest.questId === "comprehension1") {
      setStarting(true);
      try {
        const groups =
          quest.questId === "vocab100"
            ? selectTypeSessionGroups((await Promise.all(VOCABULARY_CATEGORY_KEYS.map((c) => fetchQuestionCategory(c)))).flat())
            : selectTypeSessionGroups(await fetchQuestionCategory("comprehension"));
        if (groups.length === 0) return;
        dispatch({
          type: "START_QUIZ",
          mode: "type",
          modeLabel: quest.questId === "vocab100" ? "特别任务 词语运用 Vocabulary" : "特别任务 阅读理解 Reading Comprehension",
          groups
        });
      } catch {
        alert("加载题目失败，请重试。Failed to load questions, please try again.");
      } finally {
        setStarting(false);
      }
    } else if (quest.questId === "ballPlay") {
      dispatch({ type: "GO_TO_SCREEN", screen: (pet.inventory["ball"] ?? 0) > 0 ? "bag" : "shop" });
    } else if (quest.questId === "memoryFast") {
      dispatch({ type: "GO_TO_SCREEN", screen: (pet.inventory["puzzle"] ?? 0) > 0 ? "bag" : "shop" });
    } else if (quest.questId === "petFull") {
      // Bag.tsx already self-handles an empty bag by offering its own
      // "Visit Shop" redirect -- no smart-routing needed for this one.
      dispatch({ type: "GO_TO_SCREEN", screen: "bag" });
    }
  }

  const config = quest ? SPECIAL_QUEST_TYPES.find((q) => q.id === quest.questId) : null;

  return (
    <div className="dash-card special-quest">
      <h2 className="section-heading">🎡 特别任务 Special Quest</h2>
      <p className="mission-subhead">Spin the wheel once a day for a bonus-BP quest!</p>

      {!quest ? (
        <div className="quest-wheel-wrap">
          <div className="quest-wheel-frame">
            <div className="quest-wheel-pointer" />
            <div
              className="quest-wheel-dial"
              style={{ transform: `rotate(${dialRotation}deg)` }}
            >
              {SPECIAL_QUEST_TYPES.map((q, idx) => {
                const angle = idx * SEGMENT_DEG + SEGMENT_DEG / 2;
                return (
                  <div
                    key={q.id}
                    className="quest-wheel-slot"
                    style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -120px)` }}
                  >
                    <QuestIcon icon={q.icon} className="quest-wheel-icon" />
                  </div>
                );
              })}
            </div>
            <button className="quest-wheel-spin-btn" onClick={handleSpin} disabled={spinning}>
              Spin
            </button>
          </div>
        </div>
      ) : quest.status === "completed" && config ? (
        <div className="quest-assigned-card quest-assigned-done">
          <span className="quest-assigned-tick">✓</span>
          <QuestIcon icon={config.icon} className="quest-assigned-icon" />
          <p className="quest-assigned-label">{config.label}</p>
          <p className="quest-assigned-bonus">
            🎉 今日任务已完成！Quest complete! <span className="bp-pop">+{config.bonusBP} BP</span>
          </p>
        </div>
      ) : config ? (
        <div className="quest-assigned-card">
          <QuestIcon icon={config.icon} className="quest-assigned-icon" />
          <p className="quest-assigned-label">{config.label}</p>
          <p className="quest-assigned-bonus">完成可得 +{config.bonusBP} BP</p>
          <button className="primary-btn" disabled={starting} onClick={doQuest}>
            {starting ? "加载中... Loading..." : "去完成任务 Do Quest"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
