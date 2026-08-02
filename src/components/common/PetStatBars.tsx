import { computeCurrentMood, getAge } from "../../state/PetContext";
import { GROWTH_PER_AGE_YEAR } from "../../data/pet";
import type { PetState } from "../../data/types";

// Shared growth + hunger progress bars, used on both the Owl detail screen
// and the Bag/Feed screen so a student can see both stats wherever they're
// looking at the pet, not just growth.
//
// The growth bar deliberately always measures progress within the *current*
// age year (0-100, resetting every GROWTH_PER_AGE_YEAR), not progress toward
// the next evolution stage -- how many years a stage takes is meant to stay
// a surprise (see PET_STAGES.minAgeYears), so nothing here reveals it.
export function PetStatBars({ pet }: { pet: PetState }) {
  const mood = computeCurrentMood(pet);
  const age = getAge(pet.growth);
  const yearProgress = pet.growth % GROWTH_PER_AGE_YEAR;
  const growthPct = Math.round((yearProgress / GROWTH_PER_AGE_YEAR) * 100);
  const moodPct = Math.round(mood);

  return (
    <div className="pet-stat-bars">
      <div>
        <div className="stat-bar-label">🌱 成长 Growth · 🎂 {age} 岁 {age} yrs</div>
        <div className="growth-bar">
          <div className="growth-bar-fill" style={{ width: `${growthPct}%` }} />
        </div>
        <div className="growth-caption">{yearProgress}/{GROWTH_PER_AGE_YEAR}</div>
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
