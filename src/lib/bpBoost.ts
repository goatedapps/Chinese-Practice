import { BP_BOOST_CHANCE, BP_BOOST_MULTIPLIER } from "../data/pet";
import { dateKey } from "./stats";

// Deterministic per-day hash (FNV-1a) rather than real randomness, so every
// account/device agrees on the same boost days with no server round trip --
// the app has to keep working fully offline. Predictability if someone
// reverse-engineers this is an accepted tradeoff, not a bug.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296; // -> [0, 1)
}

function isBpBoostDay(now: number): boolean {
  return hashString(`bp-boost-${dateKey(now)}`) < BP_BOOST_CHANCE;
}

// Computed once per page load, like data/levels.ts's module-level
// currentLevel -- nothing ever mutates this, so unlike that value there's no
// sync hazard to worry about. A tab left open across midnight won't flip
// this until reload; not worth extra machinery for a cosmetic economy bonus.
export const bpBoostActive: boolean = isBpBoostDay(Date.now());

export function boostedBp(base: number): number {
  return bpBoostActive ? base * BP_BOOST_MULTIPLIER : base;
}
