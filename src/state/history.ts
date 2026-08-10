import type { HistoryEntry } from "../data/types";
import { loadJSON, saveJSON } from "../lib/storage";
import { makeId } from "../lib/id";
import { saveAndSync } from "../lib/sync";

// Exported so state/SyncBootstrap.tsx can include this store in the set of
// keys it reconciles against Supabase after sign-in -- see lib/sync.ts.
export const HISTORY_KEY = "hanyuPracticeHistory_v2";

// Lazily assigns ids to any pre-existing entries that predate the
// clear/delete feature, so every row has a stable key to delete by.
export function loadHistory(): HistoryEntry[] {
  const raw = loadJSON<HistoryEntry[]>(HISTORY_KEY, []);
  let mutated = false;
  const hist = raw.map((h) => {
    if (h.id) return h;
    mutated = true;
    return { ...h, id: makeId() };
  });
  if (mutated) saveJSON(HISTORY_KEY, hist);
  return hist;
}

export function saveHistory(entry: Omit<HistoryEntry, "id">): void {
  const hist = [{ ...entry, id: makeId() }, ...loadHistory()].slice(0, 50);
  saveAndSync(HISTORY_KEY, hist);
}

export function deleteHistoryEntry(id: string): void {
  const hist = loadHistory().filter((h) => h.id !== id);
  saveAndSync(HISTORY_KEY, hist);
}
