import { useMemo } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getAge, getStage } from "../../state/PetContext";
import { PET_STAGES, GROWTH_PER_AGE_YEAR, GROWTH_ICON, HUNGER_ICON } from "../../data/pet";
import { OwlArt } from "../common/OwlArt";
import type { MoodBucket } from "../../data/types";

const SPEECH_LINES: Record<MoodBucket, string[]> = {
  sad: [
    "我有点饿了…… I'm getting hungry...",
    "肚子咕咕叫了…… My tummy is rumbling...",
    "好久没人理我了 It's been a while since anyone visited...",
    "我需要吃点东西 I could really use a snack..."
  ],
  neutral: [
    "还好，但有点想你 I'm okay, but I miss you a little",
    "今天想做点什么呢？What should we do today?",
    "陪我玩一会儿吧 Come hang out with me for a bit"
  ],
  happy: [
    "我们一起学习吧！Let's learn together today!",
    "今天心情不错！Feeling good today!",
    "准备好练习了吗？Ready to practice?"
  ],
  very_happy: [
    "谢谢你照顾我！Thanks for taking care of me!",
    "有你真好！I'm so glad you're here!",
    "我们是最棒的搭档！We make a great team!"
  ]
};

// The whole card is one <button> navigating to the Owl screen (which has
// its own Feed button routing to Bag/Shop based on inventory). The greeting
// now lives in Home.tsx's own header strip (garden redesign), and BP moved
// to the top nav's stat pill -- this card is just the pet's own identity/
// bars/art/speech, single column top-to-bottom.
export function PetHeroCard() {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const mood = computeCurrentMood(pet);
  const age = getAge(pet.growth);
  const stage = getStage(pet.growth);
  const bucket = moodBucket(mood);
  // Picks a fresh random line whenever the mood bucket itself changes, not
  // on every incidental re-render (e.g. a BP change elsewhere) -- otherwise
  // the speech would visibly jump around for no reason tied to the pet.
  const speechLine = useMemo(() => {
    const lines = SPEECH_LINES[bucket];
    return lines[Math.floor(Math.random() * lines.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  const stageNum = PET_STAGES.findIndex((s) => s.key === stage.key) + 1;
  // Always progress within the current age year, not toward the next
  // evolution stage -- see PetStatBars.tsx for why (kept a surprise).
  const yearProgress = pet.growth % GROWTH_PER_AGE_YEAR;
  const growthPct = Math.round((yearProgress / GROWTH_PER_AGE_YEAR) * 100);
  // Matches the Owl/Bag screens' hunger bar (PetStatBars): the bar fills as
  // the pet gets *more* satiated, same as mood itself -- not inverted.
  const hunger = Math.round(mood);

  return (
    <button className="pet-hero-card" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
      <div className="pet-hero-identity">
        <div className="pet-hero-name">{pet.name || "为它取个名字吧 Name your pet"}</div>
        <div className="pet-hero-stage-badge">
          {stage.label} · {age}岁 · 第 {stageNum}／{PET_STAGES.length} 阶段
        </div>
      </div>

      <div className="pet-hero-art-frame">
        <OwlArt stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-hero" playSound />
      </div>

      <div className="pet-hero-bars">
        <div className="pet-hero-bar-row">
          <div className="pet-hero-bar-label">
            <span className="stat-name"><img className="stat-bar-icon" src={GROWTH_ICON} alt="" /> 成长 Growth</span>
            <b>{yearProgress}/{GROWTH_PER_AGE_YEAR}</b>
          </div>
          <div className="growth-bar">
            <div className="growth-bar-fill" style={{ width: `${growthPct}%` }} />
          </div>
        </div>
        <div className="pet-hero-bar-row">
          <div className="pet-hero-bar-label">
            <span className="stat-name"><img className="stat-bar-icon" src={HUNGER_ICON} alt="" /> 饱食度 Hunger</span>
            <b>{hunger}/100</b>
          </div>
          <div className="mood-bar">
            <div className="mood-bar-fill" style={{ width: `${hunger}%` }} />
          </div>
        </div>
      </div>

      <div className="pet-hero-speech">{speechLine}</div>
    </button>
  );
}
