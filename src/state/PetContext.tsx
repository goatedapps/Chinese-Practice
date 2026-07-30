import { createContext, useContext, useState, type ReactNode } from "react";
import type { PetState, MoodBucket, ShopItem } from "../data/types";
import { PET_DEFAULT_STATE, PET_STAGES, MOOD_DECAY_PER_HOUR } from "../data/pet";
import { logAchievement } from "./achievements";

const PET_KEY = "hanyuPracticePet_v1";

function loadPetState(): PetState {
  try {
    const saved = JSON.parse(localStorage.getItem(PET_KEY) || "null");
    if (saved) return { ...PET_DEFAULT_STATE, ...saved };
  } catch {
    // ignore corrupt/missing localStorage value
  }
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

export function getStage(growth: number) {
  let current = PET_STAGES[0];
  for (const stage of PET_STAGES) {
    if (growth >= stage.minGrowth) current = stage;
  }
  return current;
}

export function nextStage(growth: number) {
  return PET_STAGES.find((s) => s.minGrowth > growth) ?? null;
}

interface PetContextValue {
  pet: PetState;
  awardBP: (amount: number) => void;
  buyItem: (item: ShopItem) => void;
  // Returns whether this give triggered a stage evolution, so callers (see
  // Bag.tsx) can play the level-up sound instead of the routine gift sound.
  giveItem: (item: ShopItem) => boolean;
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

  // Applies a bagged item's growth/mood effect to the owl and removes it
  // from the Bag. Called once the item's throw animation lands (see
  // components/Bag/Bag.tsx), not immediately when the student clicks Give.
  function giveItem(item: ShopItem): boolean {
    const have = pet.inventory[item.id] ?? 0;
    if (have <= 0) return false;

    // Achievement logging reads `pet` (component scope, not the `prev`
    // inside the updater below) so it isn't tied to the updater's
    // once-or-twice-in-StrictMode internals -- it runs exactly once per
    // genuine click, same as any other event handler.
    const prevStage = getStage(pet.growth);
    const nextStageAfter = getStage(pet.growth + item.growth);
    const evolved = nextStageAfter.key !== prevStage.key;
    logAchievement({ type: "fed", detail: item.id });
    if (evolved) {
      logAchievement({ type: "evolved", detail: nextStageAfter.key });
    }

    setPet((prev) => {
      const have2 = prev.inventory[item.id] ?? 0;
      if (have2 <= 0) return prev;
      const currentMood = computeCurrentMood(prev);
      const next: PetState = {
        ...prev,
        inventory: { ...prev.inventory, [item.id]: have2 - 1 },
        moodAtCheckpoint: Math.min(100, currentMood + item.mood),
        lastFedAt: Date.now(),
        growth: prev.growth + item.growth
      };
      savePetState(next);
      return next;
    });

    return evolved;
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
    <PetCtx.Provider value={{ pet, awardBP, buyItem, giveItem, renameOwl, recordQuestionsCompleted }}>
      {children}
    </PetCtx.Provider>
  );
}

export function usePet(): PetContextValue {
  const ctx = useContext(PetCtx);
  if (!ctx) throw new Error("usePet must be used within PetProvider");
  return ctx;
}
