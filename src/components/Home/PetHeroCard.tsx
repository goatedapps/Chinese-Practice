import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage, nextStage } from "../../state/PetContext";
import { PET_STAGES } from "../../data/pet";
import { OwlArt } from "../common/OwlArt";
import type { MoodBucket } from "../../data/types";

const SPEECH_LINES: Record<MoodBucket, string> = {
  sad: "我有点饿了…… I'm getting hungry...",
  neutral: "还好，但有点想你 I'm okay, but I miss you a little",
  happy: "我们一起学习吧！Let's learn together today!",
  very_happy: "谢谢你照顾我！Thanks for taking care of me!"
};

// .pet-hero-card is a plain <div>, not a button: it holds two independent
// buttons (identity + feed) side by side, and a <button> nested inside a
// <button> is invalid HTML that browsers reparent unpredictably.
export function PetHeroCard() {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const next = nextStage(pet.growth);
  const bucket = moodBucket(mood);

  const stageNum = PET_STAGES.findIndex((s) => s.key === stage.key) + 1;
  const growthPct = next
    ? Math.round(((pet.growth - stage.minGrowth) / (next.minGrowth - stage.minGrowth)) * 100)
    : 100;
  const hunger = Math.round(100 - mood);
  const hasItems = Object.values(pet.inventory).some((n) => n > 0);

  return (
    <div className="dash-card pet-hero-card">
      <div className="pet-hero-art-col">
        <OwlArt stageKey={stage.key} mood={bucket} label={stage.label} sizeClass="owl-hero" />
        <div className="pet-hero-speech">{SPEECH_LINES[bucket]}</div>
      </div>

      <div className="pet-hero-info-col">
        <button className="pet-hero-identity" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "owl" })}>
          <div>
            <div className="pet-hero-name">{pet.name || "为它取个名字吧 Name your pet"}</div>
            <div className="pet-hero-stage-badge">
              {stage.label} · 第 {stageNum}／{PET_STAGES.length} 阶段
            </div>
          </div>
        </button>

        <div className="pet-hero-bars">
          <div className="pet-hero-bar-row">
            <div className="pet-hero-bar-label">
              <span>成长 Growth</span>
              <b>{next ? `距离${next.label}还需 ${next.minGrowth - pet.growth}` : "已完全长大 Fully grown"}</b>
            </div>
            <div className="growth-bar">
              <div className="growth-bar-fill" style={{ width: `${growthPct}%` }} />
            </div>
          </div>
          <div className="pet-hero-bar-row">
            <div className="pet-hero-bar-label">
              <span>饥饿 Hunger</span>
              <b>{hunger}%</b>
            </div>
            <div className="hunger-bar">
              <div className="hunger-bar-fill" style={{ width: `${hunger}%` }} />
            </div>
          </div>
        </div>

        <div className="pet-hero-footer">
          <div className="pet-status-bp">💡 {pet.bp} BP</div>
          <button
            className="primary-btn pet-hero-feed-btn"
            onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: hasItems ? "bag" : "shop" })}
          >
            🍚 喂食 Feed {pet.name || "它"}
          </button>
        </div>
      </div>
    </div>
  );
}
