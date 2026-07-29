import { createContext, useContext, useState, type ReactNode } from "react";
import type { PetState, MoodBucket, ShopItem } from "../data/types";
import { PET_DEFAULT_STATE, PET_STAGES, MOOD_DECAY_PER_HOUR } from "../data/pet";

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

  // Buying immediately feeds/plays with the owl -- no separate "inventory" step.
  function buyItem(item: ShopItem) {
    setPet((prev) => {
      if (prev.bp < item.cost) return prev;
      const currentMood = computeCurrentMood(prev);
      const next: PetState = {
        ...prev,
        bp: prev.bp - item.cost,
        moodAtCheckpoint: Math.min(100, currentMood + item.mood),
        lastFedAt: Date.now(),
        growth: prev.growth + item.growth,
        purchaseHistory: [
          { itemId: item.id, cost: item.cost, ts: Date.now() },
          ...prev.purchaseHistory
        ].slice(0, 50)
      };
      savePetState(next);
      return next;
    });
  }

  return <PetCtx.Provider value={{ pet, awardBP, buyItem }}>{children}</PetCtx.Provider>;
}

export function usePet(): PetContextValue {
  const ctx = useContext(PetCtx);
  if (!ctx) throw new Error("usePet must be used within PetProvider");
  return ctx;
}
