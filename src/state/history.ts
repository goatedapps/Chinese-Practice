import type { HistoryEntry } from "../data/types";

const HISTORY_KEY = "hanyuPracticeHistory_v2";

function makeHistoryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Lazily assigns ids to any pre-existing entries that predate the
// clear/delete feature, so every row has a stable key to delete by.
export function loadHistory(): HistoryEntry[] {
  try {
    const raw: HistoryEntry[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "null") ?? [];
    let mutated = false;
    const hist = raw.map((h) => {
      if (h.id) return h;
      mutated = true;
      return { ...h, id: makeHistoryId() };
    });
    if (mutated) localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    return hist;
  } catch {
    return [];
  }
}

export function saveHistory(entry: Omit<HistoryEntry, "id">): void {
  const hist = [{ ...entry, id: makeHistoryId() }, ...loadHistory()].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

export function clearAllHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryEntry(id: string): void {
  const hist = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}
