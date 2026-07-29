import { useAppDispatch } from "../../state/AppStateContext";
import { usePet, computeCurrentMood, moodBucket, getStage, nextStage } from "../../state/PetContext";
import { owlSpritePath } from "../../data/pet";

const MOOD_LABELS: Record<string, string> = {
  sad: "心情低落 Sad",
  neutral: "心情平静 Neutral",
  happy: "心情满足 Happy",
  very_happy: "心情开心 Very Happy"
};

export function Owl() {
  const dispatch = useAppDispatch();
  const { pet } = usePet();
  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const next = nextStage(pet.growth);
  const bucket = moodBucket(mood);
  const pct = next ? Math.round(((pet.growth - stage.minGrowth) / (next.minGrowth - stage.minGrowth)) * 100) : 100;
  const bagCount = Object.values(pet.inventory).reduce((sum, n) => sum + n, 0);

  return (
    <div className="screen owl-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        ← 返回 Back
      </button>
      <h1>我的猫头鹰 My Owl</h1>
      <div className={`owl-art owl-stage-${stage.key} owl-large`}>
        <img src={owlSpritePath(stage.key, bucket)} alt={stage.label} />
      </div>
      <div className="owl-info">
        <div className="owl-stage-label">{stage.label}</div>
        <div className="owl-mood-label">{MOOD_LABELS[bucket]}</div>
        <div className="growth-bar">
          <div className="growth-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="growth-caption">
          {next ? `距离 ${next.label} 还需 ${next.minGrowth - pet.growth} 成长值` : "已完全长大 Fully grown!"}
        </div>
        <div className="owl-bp-label">💡 可用 BP: {pet.bp}</div>
      </div>
      <div className="action-row">
        <button className="primary-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "shop" })}>
          🛍 商店 Shop
        </button>
        <button className="secondary-btn" onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "bag" })}>
          🎒 道具袋 Bag{bagCount ? ` (${bagCount})` : ""}
        </button>
      </div>
    </div>
  );
}
