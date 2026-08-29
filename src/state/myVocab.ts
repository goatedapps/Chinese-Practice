import type { MyVocabEntry } from "../data/types";
import { loadJSON } from "../lib/storage";
import { makeId } from "../lib/id";
import { saveAndSync } from "../lib/sync";

// Exported so state/SyncBootstrap.tsx can include this store in the set of
// keys it reconciles against Supabase after sign-in -- see lib/sync.ts.
export const MY_VOCAB_KEY = "hanyuPracticeMyVocab_v1";
const MAX_MY_VOCAB = 200;

export function loadMyVocab(): MyVocabEntry[] {
  return loadJSON<MyVocabEntry[]>(MY_VOCAB_KEY, []);
}

export function isWordSaved(word: string): boolean {
  return loadMyVocab().some((e) => e.word === word);
}

// Dedup by word text (not source lesson) -- the same word saved from two
// different lessons still only ever shows up once. Returns false (no-op) if
// the word is already saved, so callers can tell an add from a no-op.
export function addToMyVocab(entry: Omit<MyVocabEntry, "id" | "savedAt">): boolean {
  const list = loadMyVocab();
  if (list.some((e) => e.word === entry.word)) return false;
  const next = [{ ...entry, id: makeId(), savedAt: Date.now() }, ...list].slice(0, MAX_MY_VOCAB);
  saveAndSync(MY_VOCAB_KEY, next);
  return true;
}

export function removeFromMyVocab(word: string): void {
  saveAndSync(MY_VOCAB_KEY, loadMyVocab().filter((e) => e.word !== word));
}
