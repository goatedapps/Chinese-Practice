// Reads and JSON-parses a localStorage value, falling back to `fallback` if
// the key is missing, the stored value isn't valid JSON, or localStorage
// itself is unavailable (e.g. a locked-down embedded/test environment).
// Shared by every localStorage-backed store in state/ and PetContext.tsx so
// each doesn't need its own try/catch around the same read.
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Write-side counterpart to loadJSON above -- plain JSON.stringify + setItem,
// no try/catch (a write failing, e.g. a full/locked-down localStorage, isn't
// something any caller here can meaningfully recover from). Stores that sync
// to Supabase (see lib/sync.ts) call saveAndSync() instead, which wraps this.
export function saveJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
