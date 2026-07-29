import type { HistoryEntry } from "../data/types";

const HISTORY_KEY = "hanyuPracticeHistory_v2";

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "null") ?? [];
  } catch {
    return [];
  }
}

export function saveHistory(entry: HistoryEntry): void {
  const hist = [entry, ...loadHistory()].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}
