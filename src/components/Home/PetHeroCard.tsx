import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getAge, getStage } from "../../state/PetContext";
import { PET_STAGES, GROWTH_PER_AGE_YEAR } from "../../data/pet";
import { getTodayStats } from "../../lib/stats";
import { OwlArt } from "../common/OwlArt";
import type { MoodBucket, HistoryEntry } from "../../data/types";

const SPEECH_LINES: Record<MoodBucket, string> = {
  sad: "我有点饿了…… I'm getting hungry...",
  neutral: "还好，但有点想你 I'm okay, but I miss you a little",
  happy: "我们一起学习吧！Let's learn together today!",
  very_happy: "谢谢你照顾我！Thanks for taking care of me!"
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好 Good morning";
  if (hour < 18) return "下午好 Good afternoon";
  return "晚上好 Good evening";
}

// The whole card is one <button> navigating to the Owl screen (which has
// its own Feed button routing to Bag/Shop based on inventory) -- no nested
// buttons, so no HTML-validity constraint to work around here. Merges what
// used to be Home's separate greeting section into this card's left column
// (greeting on top, pet identity/bars below it) so the greeting and the pet
// read as one unit, not two stacked sections -- the right column is the BP
// badge above the art, not beside the stage badge.
export function PetHeroCard({ hist }: { hist: HistoryEntry[] }) {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const { questions } = getTodayStats(hist);
  const mood = computeCurrentMood(pet);
  const age = getAge(pet.growth);
  const stage = getStage(pet.growth);
  const bucket = moodBucket(mood);

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
      <div className="pet-hero-row">
        <div className="pet-hero-left">
          <div className="pet-hero-welcome">
            <h1 className="pet-hero-greeting">{greeting()} 👋</h1>
            <p className="pet-hero-subgreeting">
              {questions > 0
                ? `你今天已经完成 ${questions} 题，继续保持！You've done ${questions} questions today — keep it up!`
                : "今天还没开始练习，快来陪陪你的小伙伴吧！No practice yet today — let's get started with your buddy!"}
            </p>
          </div>

          <div className="pet-hero-identity">
            <div className="pet-hero-name">{pet.name || "为它取个名字吧 Name your pet"}</div>
            <div className="pet-hero-stage-badge">
              {stage.label} · 🎂 {age}岁 · 第 {stageNum}／{PET_STAGES.length} 阶段
            </div>
          </div>

          <div className="pet-hero-bars">
            <div className="pet-hero-bar-row">
              <div className="pet-hero-bar-label">
                <span>成长 Growth</span>
                <b>{yearProgress}/{GROWTH_PER_AGE_YEAR}</b>
              </div>
              <div className="growth-bar">
                <div className="growth-bar-fill" style={{ width: `${growthPct}%` }} />
              </div>
            </div>
            <div className="pet-hero-bar-row">
              <div className="pet-hero-bar-label">
                <span>🍚 饱食度 Hunger</span>
                <b>{hunger}/100</b>
              </div>
              <div className="mood-bar">
                <div className="mood-bar-fill" style={{ width: `${hunger}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="pet-hero-right">
          <div className="pet-status-bp">💡 {pet.bp} BP</div>
          <div className="pet-hero-art-col">
            <OwlArt stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-hero" playSound />
            <div className="pet-hero-speech">{SPEECH_LINES[bucket]}</div>
          </div>
        </div>
      </div>
    </button>
  );
}
