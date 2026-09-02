import { bpBoostActive, boostedBp } from "../../lib/bpBoost";

// Every "+N BP" surface in the app (CompleteScreen, Quiz's per-question
// popups, quest/mission bonus banners) renders through this instead of a
// bare "+{n} BP" string, so a boost day shows both the original and the
// doubled amount everywhere at once. `value` is always the pre-boost base
// amount the caller also passes to awardBP() -- awardBP() applies the same
// boostedBp() multiplier to the actual balance, so this only ever mirrors
// what was really awarded, never invents its own number.
export function BpAmount({ value }: { value: number }) {
  if (!bpBoostActive) return <>{`+${value} BP`}</>;
  return (
    <span className="bp-boosted">
      <s className="bp-boosted-was">+{value}</s> <strong>+{boostedBp(value)} BP</strong>
      <span className="bp-boosted-tag">×2</span>
    </span>
  );
}

// Same idea for a bare number embedded in a sentence (not the "+N BP" idiom)
// -- see TodayMission.tsx's mission-subhead hint.
export function BoostedNumber({ value }: { value: number }) {
  if (!bpBoostActive) return <>{value}</>;
  return (
    <>
      <s className="bp-boosted-was">{value}</s> <strong>{boostedBp(value)}</strong>
    </>
  );
}
