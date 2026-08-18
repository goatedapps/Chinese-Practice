// Cross-device sync engine, layered on top of the app's existing
// localStorage stores rather than replacing them -- every store keeps
// reading/writing localStorage exactly as before (see saveAndSync below),
// so the app is fully functional, instant, and unchanged for a student who
// never logs in. Only active once both `supabase` (lib/supabase.ts) is
// configured and a user is signed in; otherwise every function here no-ops.
// See CLAUDE.md's "Auth / cross-device sync" section for the full picture.
import { supabase } from "./supabase";
import { loadJSON, saveJSON } from "./storage";

const SYNC_META_KEY = "hanyuPracticeSyncMeta_v1";
const DEBOUNCE_MS = 2000;
const TABLE = "user_state";

// When each synced key was last written *locally* -- compared against
// Supabase's own `updated_at` column to decide which side wins a merge.
type SyncMeta = Record<string, number>;

function getSyncMeta(): SyncMeta {
  return loadJSON<SyncMeta>(SYNC_META_KEY, {});
}

function setSyncMeta(key: string, updatedAtMs: number): void {
  const meta = getSyncMeta();
  meta[key] = updatedAtMs;
  saveJSON(SYNC_META_KEY, meta);
}

let currentUserId: string | null = null;

// The one seam between this plain module and React: AuthContext calls this
// whenever the signed-in user changes (including to `null` on sign-out), so
// every function below knows whether/where to push without needing its own
// Context access.
export function setSyncUser(userId: string | null): void {
  currentUserId = userId;
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
// Any push that failed (most likely offline) -- retried on the next
// successful `scheduleSync` call for that key, or immediately on reconnect.
const pendingPush = new Map<string, unknown>();

async function pushRow(key: string, value: unknown): Promise<void> {
  if (!supabase || !currentUserId) return;
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: currentUserId, key, value, updated_at: new Date().toISOString() });
  if (error) pendingPush.set(key, value);
  else pendingPush.delete(key);
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    for (const [key, value] of pendingPush) void pushRow(key, value);
  });
}

function scheduleSync(key: string, value: unknown): void {
  if (!supabase || !currentUserId) return;
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      void pushRow(key, value);
    }, DEBOUNCE_MS)
  );
}

// Local write + debounced background push -- the one hook point every
// syncing store (history.ts, achievements.ts, tingxieProgress.ts,
// PetContext.tsx's savePetState) calls instead of a raw localStorage write.
// The local half always happens; the push half silently no-ops when signed
// out or Supabase isn't configured, so nothing here can slow down or change
// behavior for a student who never logs in.
//
// Sync-meta is only stamped while `currentUserId` is genuinely set (i.e.
// this write happened while actually signed in as a real account) -- not
// while playing as a guest. Guest play still saves locally exactly as
// before, it just never claims a "just now" timestamp for merge purposes.
// Without this guard, a guest session's local timestamp could later outrank
// an *existing* account's real remote `updated_at` the moment that guest
// logs in, and pullAndMergeAll's last-write-wins merge would push the
// guest's local data up over the account's actual cloud progress -- a
// second variant of the cross-account data leak clearSyncMeta() (see below)
// exists to prevent, this time via guest activity rather than a previous
// account's leftover session.
export function saveAndSync<T>(key: string, value: T): void {
  saveJSON(key, value);
  if (currentUserId) setSyncMeta(key, Date.now());
  scheduleSync(key, value);
}

// Wipes a synced store's local copy entirely -- used only when a brand-new
// account is created (see components/Auth/Auth.tsx's sign-up success path),
// so a fresh signup never inherits whatever happened to be sitting in this
// browser's localStorage (anonymous local play, or a previous account's
// leftover test data) as if it were this new account's progress. Every
// store here already treats "key absent" as its empty/default state
// (loadJSON's fallback), so a plain removal is enough -- no need to write an
// explicit empty value.
export function clearLocalStore(key: string): void {
  localStorage.removeItem(key);
}

// Wipes every locally-recorded "when did I last save this key" timestamp --
// called (alongside clearLocalStore() for each synced key) whenever local
// storage is being reset to a clean slate: a brand-new signup (see
// components/Auth/Auth.tsx's startFresh()) and, critically, a genuine
// sign-out (see state/SyncBootstrap.tsx). Without this, a stale timestamp
// left over from the *previous* signed-in account could make
// pullAndMergeAll() think that leftover local value is newer than the
// next signed-in user's real remote row and push it up as theirs -- the
// cross-account data leak this exists to prevent.
export function clearSyncMeta(): void {
  localStorage.removeItem(SYNC_META_KEY);
}

// Pull-side primitive: writes remote data straight to local storage and
// records the *remote's* updated_at as this key's sync-meta timestamp (not
// "now") -- deliberately not saveAndSync, so a merge-pull can never schedule
// a redundant push right back to Supabase.
export function applyRemoteToLocal<T>(key: string, value: T, remoteUpdatedAtMs: number): void {
  saveJSON(key, value);
  setSyncMeta(key, remoteUpdatedAtMs);
}

interface SyncRow {
  key: string;
  value: unknown;
  updated_at: string;
}

// One-time reconciliation run right after sign-in (see
// state/SyncBootstrap.tsx, which assembles `syncKeys` from each store's own
// exported KEY constant). Whole-store last-write-wins per key, compared via
// this device's local sync-meta timestamp against Supabase's `updated_at` --
// not per-field merging (a kid playing on two devices rarely truly
// concurrently, same reasoning as the Special Quest wheel's dedup guard).
// `petKey`/`onPetRow` exist because the pet store alone is held in live React
// state (PetContext) rather than only read lazily on mount -- everything
// else lands via applyRemoteToLocal and is picked up next time its owning
// screen mounts.
export async function pullAndMergeAll(
  userId: string,
  syncKeys: string[],
  opts: { petKey?: string; onPetRow?: (value: unknown, remoteUpdatedAtMs: number) => void } = {}
): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.from(TABLE).select("key,value,updated_at").eq("user_id", userId);
  if (error || !data) return;

  const remoteByKey = new Map<string, SyncRow>((data as SyncRow[]).map((row) => [row.key, row]));
  const meta = getSyncMeta();

  for (const key of syncKeys) {
    const remote = remoteByKey.get(key);

    if (!remote) {
      // No remote row yet -- first login on a device with existing local
      // progress, or a genuinely fresh store. Push local as-is, if any.
      const local = loadJSON<unknown>(key, null);
      if (local !== null) void pushRow(key, local);
      continue;
    }

    const remoteMs = new Date(remote.updated_at).getTime();
    const localMs = meta[key] ?? null;

    if (localMs === null || remoteMs > localMs) {
      if (key === opts.petKey && opts.onPetRow) opts.onPetRow(remote.value, remoteMs);
      else applyRemoteToLocal(key, remote.value, remoteMs);
    } else if (localMs > remoteMs) {
      const local = loadJSON<unknown>(key, null);
      if (local !== null) void pushRow(key, local);
    }
  }
}
