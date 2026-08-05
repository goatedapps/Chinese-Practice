import { createContext, useContext, useState, type ReactNode } from "react";
import type { PetState, MoodBucket, ShopItem } from "../data/types";
import { PET_DEFAULT_STATE, PET_STAGES, MOOD_DECAY_PER_HOUR, GROWTH_PER_AGE_YEAR, specialQuestConfig } from "../data/pet";
import { loadJSON } from "../lib/storage";
import { getTodaySpecialQuest, completeSpecialQuest } from "./specialQuest";
import { logAchievement } from "./achievements";

const PET_KEY = "hanyuPracticePet_v1";

function loadPetState(): PetState {
  const saved = loadJSON<Partial<PetState> | null>(PET_KEY, null);
  if (saved) return { ...PET_DEFAULT_STATE, ...saved };
  return { ...PET_DEFAULT_STATE, lastFedAt: Date.now() };
}

function savePetState(pet: PetState): void {
  localStorage.setItem(PET_KEY, JSON.stringify(pet));
}

// Mood is derived, never stored as an already-decayed value: pet.moodAtCheckpoint
// + pet.lastFedAt is a fixed pair, and this function decays from that pair fresh
// every call -- calling it repeatedly (every render) never compounds rounding
// error. Growth/stage is completely separate and never affected by decay.
export function computeCurrentMood(pet: PetState, now: number = Date.now()): number {
  const hoursElapsed = Math.max(0, (now - pet.lastFedAt) / 3600000);
  return Math.max(0, Math.min(100, pet.moodAtCheckpoint - MOOD_DECAY_PER_HOUR * hoursElapsed));
}

export function moodBucket(mood: number): MoodBucket {
  if (mood < 25) return "sad";
  if (mood < 50) return "neutral";
  if (mood < 75) return "happy";
  return "very_happy";
}

// Age in years -- purely derived from raw growth points, same as
// computeCurrentMood() deriving mood fresh from a checkpoint rather than
// storing an already-decayed value. 100 growth (default GROWTH_PER_AGE_YEAR)
// = 1 year.
export function getAge(growth: number): number {
  return Math.floor(growth / GROWTH_PER_AGE_YEAR);
}

export function getStage(growth: number) {
  const age = getAge(growth);
  let current = PET_STAGES[0];
  for (const stage of PET_STAGES) {
    if (age >= stage.minAgeYears) current = stage;
  }
  return current;
}

export function nextStage(growth: number) {
  const age = getAge(growth);
  return PET_STAGES.find((s) => s.minAgeYears > age) ?? null;
}

interface PetContextValue {
  pet: PetState;
  awardBP: (amount: number) => void;
  buyItem: (item: ShopItem) => void;
  // Returns whether this give crossed an age-year boundary (every 100
  // growth -- see GROWTH_PER_AGE_YEAR), so callers (see Bag.tsx) know to
  // play the level-up sound + show the "grew a year" celebration instead of
  // the routine gift sound. A stage evolution is always also an age-up (each
  // PET_STAGES.minAgeYears is itself a specific age), so `agedUp` alone is
  // sufficient -- callers don't need a separate "evolved" signal.
  giveItem: (item: ShopItem) => { agedUp: boolean; age: number };
  // Play flow (see components/Play/): starting a toy's minigame removes it
  // from the Bag immediately (consumeItem), same "irreversible once started"
  // rule as feeding -- abandoning the game mid-play still costs the item.
  // The mood reward is only granted separately, once the game actually
  // reports a completion (applyPlayReward) -- so leaving early forfeits the
  // reward without needing any extra "was it abandoned" state.
  consumeItem: (item: ShopItem) => void;
  applyPlayReward: (item: ShopItem, moodReward: number) => { agedUp: boolean; age: number };
  renameOwl: (name: string) => void;
  recordQuestionsCompleted: (n: number) => void;
}

const PetCtx = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [pet, setPet] = useState<PetState>(loadPetState);

  function awardBP(amount: number) {
    setPet((prev) => {
      const next = { ...prev, bp: prev.bp + amount, bpLifetime: prev.bpLifetime + amount };
      savePetState(next);
      return next;
    });
  }

  // Buying only puts the item in the Bag -- its growth/mood effect is
  // applied later, when the student gives it to the owl (see giveItem).
  function buyItem(item: ShopItem) {
    setPet((prev) => {
      if (prev.bp < item.cost) return prev;
      const next: PetState = {
        ...prev,
        bp: prev.bp - item.cost,
        inventory: { ...prev.inventory, [item.id]: (prev.inventory[item.id] ?? 0) + 1 },
        purchaseHistory: [
          { itemId: item.id, cost: item.cost, ts: Date.now() },
          ...prev.purchaseHistory
        ].slice(0, 50)
      };
      savePetState(next);
      return next;
    });
  }

  // Shared by giveItem (food/instant-give) and applyPlayReward (toys, after
  // a minigame reports a score): applies growth + a given mood amount to the
  // pet. Does NOT touch inventory -- giveItem decrements it here since food
  // is consumed and applied in one step, but applyPlayReward's item was
  // already decremented earlier by consumeItem (see the Play flow note on
  // PetContextValue above), so it must not double-decrement.
  function applyGrowthAndMood(moodAmount: number, growthAmount: number): { agedUp: boolean; age: number } {
    const newGrowth = pet.growth + growthAmount;
    const newAge = getAge(newGrowth);
    const agedUp = newAge > getAge(pet.growth);
    // Read from the same outer `pet` closure as newGrowth/agedUp above
    // (not `prev` inside the setPet updater) -- an existing quirk of this
    // function, harmless here since this is only used for the >=100 "quest
    // complete" check below, not persisted.
    const newMood = Math.min(100, computeCurrentMood(pet) + moodAmount);

    setPet((prev) => {
      const currentMood = computeCurrentMood(prev);
      const next: PetState = {
        ...prev,
        moodAtCheckpoint: Math.min(100, currentMood + moodAmount),
        lastFedAt: Date.now(),
        growth: prev.growth + growthAmount
      };
      savePetState(next);
      return next;
    });

    // "Fill your pet's hunger to 100%" Special Quest (see
    // components/Home/SpecialQuest.tsx) -- reachable via feeding (giveItem)
    // or a toy's mood reward (applyPlayReward), both of which funnel through
    // here, so this one check covers both routes. completeSpecialQuest()
    // itself is the dedup guard (only true once, the first time mood hits
    // 100 while this quest is pending that day).
    if (newMood >= 100 && getTodaySpecialQuest()?.questId === "petFull" && completeSpecialQuest("petFull")) {
      const config = specialQuestConfig("petFull");
      if (config) awardBP(config.bonusBP);
      logAchievement({ type: "specialQuestComplete", detail: "petFull" });
    }

    return { agedUp, age: newAge };
  }

  // Applies a bagged item's growth/mood effect to the owl and removes it
  // from the Bag. Called once the item's throw animation lands (see
  // components/Bag/Bag.tsx), not immediately when the student clicks Give.
  function giveItem(item: ShopItem): { agedUp: boolean; age: number } {
    const have = pet.inventory[item.id] ?? 0;
    if (have <= 0) return { agedUp: false, age: getAge(pet.growth) };

    setPet((prev) => {
      const have2 = prev.inventory[item.id] ?? 0;
      if (have2 <= 0) return prev;
      return { ...prev, inventory: { ...prev.inventory, [item.id]: have2 - 1 } };
    });

    return applyGrowthAndMood(item.mood, item.growth);
  }

  // Removes one of `item` from the Bag with no growth/mood effect -- used to
  // consume a toy the moment its minigame starts (see the Play flow note on
  // PetContextValue above).
  function consumeItem(item: ShopItem): void {
    setPet((prev) => {
      const have = prev.inventory[item.id] ?? 0;
      if (have <= 0) return prev;
      const next: PetState = { ...prev, inventory: { ...prev.inventory, [item.id]: have - 1 } };
      savePetState(next);
      return next;
    });
  }

  // Grants a minigame's earned mood reward once it reports a completed
  // score -- item.growth is applied too (0 for every toy today, but future
  // toys could carry growth same as food). Inventory was already decremented
  // by consumeItem when the game started, so this never touches it.
  function applyPlayReward(item: ShopItem, moodReward: number): { agedUp: boolean; age: number } {
    return applyGrowthAndMood(moodReward, item.growth);
  }

  function renameOwl(name: string) {
    const trimmed = name.trim().slice(0, 12);
    setPet((prev) => {
      const next = { ...prev, name: trimmed };
      savePetState(next);
      return next;
    });
  }

  // Pure increment/persist -- no achievement logic here (that lives in
  // Result.tsx, computed arithmetically from the *pre*-call value, to avoid
  // reading a stale/batched value back out of context immediately after).
  function recordQuestionsCompleted(n: number) {
    if (n <= 0) return;
    setPet((prev) => {
      const next = { ...prev, questionsLifetime: prev.questionsLifetime + n };
      savePetState(next);
      return next;
    });
  }

  return (
    <PetCtx.Provider
      value={{ pet, awardBP, buyItem, giveItem, consumeItem, applyPlayReward, renameOwl, recordQuestionsCompleted }}
    >
      {children}
    </PetCtx.Provider>
  );
}

export function usePet(): PetContextValue {
  const ctx = useContext(PetCtx);
  if (!ctx) throw new Error("usePet must be used within PetProvider");
  return ctx;
}
