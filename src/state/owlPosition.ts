// Remembers where the student dragged the flying-owl mascot to (see
// components/common/OwlFlyover.tsx) so it lands there on every future
// departure from Home instead of its default spot. Deliberately local-only,
// not synced -- this is a physical-device UI placement preference, not
// learning progress, so it doesn't need to (and shouldn't) travel with the
// account -- see state/SyncBootstrap.tsx's SYNC_KEYS for what does.
import { loadJSON, saveJSON } from "../lib/storage";

const OWL_POSITION_KEY = "hanyuPracticeOwlPosition_v1";

export interface OwlPositionFraction {
  xFrac: number;
  yFrac: number;
}

// Stored as a fraction of the viewport, not raw pixels, so a position saved
// on one window size still lands somewhere sane on a differently-sized one.
export function saveOwlPosition(pos: OwlPositionFraction): void {
  saveJSON(OWL_POSITION_KEY, pos);
}

export function loadOwlPosition(): OwlPositionFraction | null {
  return loadJSON<OwlPositionFraction | null>(OWL_POSITION_KEY, null);
}
