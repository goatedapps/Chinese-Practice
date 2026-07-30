import { computeCurrentMood, getStage, nextStage } from "../../state/PetContext";
import type { PetState } from "../../data/types";

// Shared growth + hunger progress bars, used on both the Owl detail screen
// and the Bag/Feed screen so a student can see both stats wherever they're
// looking at the pet, not just growth.
export function PetStatBars({ pet }: { pet: PetState }) {
  const mood = computeCurrentMood(pet);
  const stage = getStage(pet.growth);
  const next = nextStage(pet.growth);
  const growthPct = next
    ? Math.round(((pet.growth - stage.minGrowth) / (next.minGrowth - stage.minGrowth)) * 100)
    : 100;
  const moodPct = Math.round(mood);

  return (
    <div className="pet-stat-bars">
      <div>
        <div className="stat-bar-label">🌱 成长 Growth</div>
        <div className="growth-bar">
          <div className="growth-bar-fill" style={{ width: `${growthPct}%` }} />
        </div>
        <div className="growth-caption">{next ? `${pet.growth}/${next.minGrowth}` : "已完全长大 Fully grown!"}</div>
      </div>
      <div>
        <div className="stat-bar-label">🍚 饱食度 Hunger</div>
        <div className="mood-bar">
          <div className="mood-bar-fill" style={{ width: `${moodPct}%` }} />
        </div>
        <div className="growth-caption">{moodPct}/100</div>
      </div>
    </div>
  );
}
