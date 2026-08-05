// Generates a compact, locally-unique id for a record kept in localStorage
// (history entries, achievements, today-summary rows) -- not
// cryptographically unique, just unique enough to key/delete one row out of
// a small capped local list.
export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
