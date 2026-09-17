import { BP_BOOST_CHANCE, BP_BOOST_MULTIPLIER } from "../data/pet";
import { dateKey } from "./stats";

// Deterministic per-day hash rather than real randomness, so every
// account/device agrees on the same boost days with no server round trip --
// the app has to keep working fully offline. Predictability if someone
// reverse-engineers this is an accepted tradeoff, not a bug.
//
// FNV-1a alone is NOT enough here: consecutive day keys differ only in their
// last character or two, and FNV's final multiply barely perturbs the high
// bits that a /2^32 divide weights most. That made the result a function of
// the *month* far more than the day -- values stayed banded within ~0.05 of
// each other for a whole month at a time, so 15 of every 36 months had no
// boost day at all and dry spells ran 120 days. The fmix32 finalizer
// (MurmurHash3's) avalanches the low bits up, which is what makes adjacent
// keys land independently.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296; // -> [0, 1)
}

function isBpBoostDay(now: number): boolean {
  // Dev-only escape hatch: boost days are rare by design (~1 in 5), so
  // `?bpboost=1` / `?bpboost=0` is the only practical way to eyeball the
  // banner and the doubled "+N BP" surfaces without waiting weeks for one.
  // Gated on import.meta.env.DEV so it can't be used to farm BP in prod.
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const forced = new URLSearchParams(window.location.search).get("bpboost");
    if (forced === "1") return true;
    if (forced === "0") return false;
  }
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
