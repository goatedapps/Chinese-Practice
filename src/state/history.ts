import type { HistoryEntry } from "../data/types";
import { loadJSON } from "../lib/storage";
import { makeId } from "../lib/id";

const HISTORY_KEY = "hanyuPracticeHistory_v2";

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
  if (mutated) localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  return hist;
}

export function saveHistory(entry: Omit<HistoryEntry, "id">): void {
  const hist = [{ ...entry, id: makeId() }, ...loadHistory()].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

export function clearAllHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryEntry(id: string): void {
  const hist = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}
