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

// True once it's safe for pushes to actually reach Supabase for the current
// signed-in user -- false from the moment a *new* user id is set until
// state/SyncBootstrap.tsx's post-sign-in pullAndMergeAll() finishes
// SUCCESSFULLY for that user (see markSyncReady() below). Starts true so an
// app that's never signed in (or has signed out) never blocks -- currentUserId
// being null already no-ops every push on its own.
//
// Why this exists: without it, any write that happens to land in the window
// between a session resolving and the merge-pull completing -- most reliably
// PetContext's mount-time growth-decay "settle" effect, which fires on
// essentially every app load -- could push a still-un-merged (possibly
// default/empty) local state up to Supabase, permanently overwriting the
// account's real remote data before pullAndMergeAll ever gets a chance to
// pull it down. See state/SyncBootstrap.tsx for the retry loop that keeps
// re-attempting the merge (on visibility/online) until it actually succeeds,
// only then calling markSyncReady().
let syncReady = true;

// The one seam between this plain module and React: AuthContext calls this
// whenever the signed-in user changes (including to `null` on sign-out), so
// every function below knows whether/where to push without needing its own
// Context access. Re-closes the syncReady gate whenever the id genuinely
// changes to a new signed-in user (a fresh sign-in needs its own merge-pull
// before it's safe to push); a repeat call with the same id (e.g. a duplicate
// onAuthStateChange firing) is a no-op so it can't re-close a gate that
// already legitimately opened.
export function setSyncUser(userId: string | null): void {
  if (userId !== currentUserId) {
    currentUserId = userId;
    syncReady = userId === null;
  }
}

// --- Canonical "what should this key currently hold in Supabase" state ---
//
// This is the actual fix for the recurring "pet reset to 0 after login" bug.
// The previous version kept a `pendingPush: Map<key, value>` that captured
// whatever value was on hand *at the moment a push got deferred* (e.g.
// because the post-login merge hadn't finished yet). If a *newer* value for
// the same key showed up afterwards -- e.g. pullAndMergeAll pulling the real
// remote pet down -- nothing ever updated that already-queued stale value,
// so markSyncReady()'s flush could push the OLD (pre-merge) value over the
// just-restored remote data. `latestValues` fixes this by being the single
// source of truth for "the value to push for this key" -- every push, no
// matter when/why it fires, re-reads it fresh instead of trusting a closure.
// `pendingKeys` just tracks *which* keys still need pushing; it never carries
// its own value.
const latestValues = new Map<string, unknown>();
const pendingKeys = new Set<string>();

// latestValues starts empty every page load (it's in-memory only) -- for a
// key nothing has written *this session* yet, fall back to whatever's
// already on disk, which is exactly the right value to push (e.g. the
// "local wins" branch of a merge, for a key untouched since that decision).
function getLatestValue(key: string): unknown {
  if (latestValues.has(key)) return latestValues.get(key);
  return loadJSON<unknown>(key, null);
}

// Called by state/SyncBootstrap.tsx once pullAndMergeAll() has genuinely
// succeeded for the current user -- flips the gate back open and flushes
// anything that was left pending while it was closed.
export function markSyncReady(): void {
  syncReady = true;
  for (const key of Array.from(pendingKeys)) void pushRow(key);
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

// The raw, ungated upsert attempt -- always reads the current latestValues
// (never a stale captured one). Never called directly by app code; go
// through pushRow (respects the syncReady gate) or flushAllNow (deliberately
// bypasses it, see below).
async function doPush(key: string): Promise<void> {
  if (!supabase || !currentUserId) return;
  const value = getLatestValue(key);
  if (value === null) {
    pendingKeys.delete(key);
    return;
  }
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: currentUserId, key, value, updated_at: new Date().toISOString() });
  if (error) pendingKeys.add(key);
  else pendingKeys.delete(key);
}

// The gated push attempt -- used by the normal debounce/retry paths. Defers
// to pendingKeys (to be flushed later by markSyncReady/online/visibility)
// instead of pushing while a post-sign-in merge is still pending -- see
// syncReady's own comment above for why.
async function pushRow(key: string): Promise<void> {
  if (!supabase || !currentUserId) return;
  if (!syncReady) {
    pendingKeys.add(key);
    return;
  }
  await doPush(key);
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    for (const key of Array.from(pendingKeys)) void pushRow(key);
  });
  // Best-effort safety net against losing a write that's still sitting in
  // its 2s debounce window if the tab gets closed/backgrounded before that
  // timer fires -- flushes whatever's pending the moment the tab is hidden,
  // not just on an explicit logout (see flushAllNow for that stronger case).
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      for (const key of Array.from(pendingKeys)) void pushRow(key);
    }
  });
}

function scheduleSync(key: string): void {
  if (!supabase || !currentUserId) return;
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      void pushRow(key);
    }, DEBOUNCE_MS)
  );
}

// Local write + debounced background push -- the one hook point every
// syncing store (history.ts, achievements.ts, tingxieProgress.ts,
// levelPreference.ts, PetContext.tsx's savePetState) calls instead of a raw
// localStorage write. The local half always happens; the push half silently
// no-ops when signed out or Supabase isn't configured, so nothing here can
// slow down or change behavior for a student who never logs in.
//
// Sync-meta is only stamped while `currentUserId` is genuinely set (i.e.
// this write happened while actually signed in as a real account) -- not
// while playing as a guest -- and only once `syncReady`, so a write made
// before the post-login merge finishes can't poison that merge's own read of
// "was local newer than remote" with a premature "just now" timestamp.
// `pendingKeys`/`latestValues` are still updated regardless of syncReady, so
// the write is never lost -- it just waits for markSyncReady() to flush it
// with its correct (freshest) value.
export function saveAndSync<T>(key: string, value: T): void {
  saveJSON(key, value);
  latestValues.set(key, value);
  if (!currentUserId) return;
  pendingKeys.add(key);
  if (syncReady) setSyncMeta(key, Date.now());
  scheduleSync(key);
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

// Wipes this module's in-memory sync bookkeeping -- called alongside
// clearSyncMeta() on a genuine sign-out (state/SyncBootstrap.tsx) and a
// brand-new signup (Auth.tsx's startFresh()). Without this, a key left
// pending from the *previous* account (e.g. a push that failed while
// offline) would still be sitting in `pendingKeys`/`latestValues` in memory
// -- and the moment the *next* user signs in on this same tab and their own
// merge calls markSyncReady(), that leftover key would get flushed straight
// into the new user's Supabase row. Same class of cross-account leak
// clearSyncMeta() exists to prevent, just for the in-memory half of the
// bookkeeping rather than the persisted half.
export function resetSyncState(): void {
  for (const timer of debounceTimers.values()) clearTimeout(timer);
  debounceTimers.clear();
  latestValues.clear();
  pendingKeys.clear();
}

// Pull-side primitive: writes remote data straight to local storage and
// records the *remote's* updated_at as this key's sync-meta timestamp (not
// "now"). Also caches the remote value as this key's latest known value and
// clears any pending-push flag -- local now genuinely matches remote, so
// there's nothing left to push, and critically this overwrites (rather than
// leaves stale) whatever a pre-merge local write may have queued for this
// key. Deliberately not saveAndSync, so a merge-pull can never schedule a
// redundant push right back to Supabase.
export function applyRemoteToLocal<T>(key: string, value: T, remoteUpdatedAtMs: number): void {
  saveJSON(key, value);
  latestValues.set(key, value);
  pendingKeys.delete(key);
  setSyncMeta(key, remoteUpdatedAtMs);
}

// Best-effort immediate flush of every key with a pending push, bypassing
// the syncReady gate (doPush, not pushRow) since by the time this is called
// we're intentionally ending the session -- there's no later chance for a
// deferred push to retry. Used by AuthContext.tsx's signOut() to guarantee
// every local change made up to that point actually reaches Supabase before
// the session ends and state/SyncBootstrap.tsx wipes local storage (see its
// sign-out effect) -- without this, a write still sitting in its 2s debounce
// window at the moment of logout was previously discarded outright. Races
// against a timeout so a dead network can't hang the sign-out button
// forever; whatever didn't make it stays queued in pendingKeys, but that's
// moot once resetSyncState() clears it right after (local data is about to
// be wiped anyway on this device).
const FLUSH_TIMEOUT_MS = 8000;

export async function flushAllNow(): Promise<void> {
  if (!supabase || !currentUserId) return;
  for (const timer of debounceTimers.values()) clearTimeout(timer);
  debounceTimers.clear();
  const keys = Array.from(pendingKeys);
  if (keys.length === 0) return;
  const pushes = Promise.all(keys.map((key) => doPush(key)));
  await Promise.race([pushes, new Promise<void>((resolve) => setTimeout(resolve, FLUSH_TIMEOUT_MS))]);
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
// Returns whether the merge genuinely completed (a real response came back
// from Supabase and every key's decision was applied) -- state/SyncBootstrap.tsx
// only calls markSyncReady() on `true`, and keeps retrying (on visibility/
// online) while it keeps coming back `false`, rather than ever opening the
// push gate on top of a merge that never actually happened.
export async function pullAndMergeAll(
  userId: string,
  syncKeys: string[],
  opts: {
    petKey?: string;
    onPetRow?: (value: unknown, remoteUpdatedAtMs: number) => void;
    levelKey?: string;
    onLevelRow?: (value: unknown, remoteUpdatedAtMs: number) => void;
  } = {}
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.from(TABLE).select("key,value,updated_at").eq("user_id", userId);
  if (error || !data) return false;

  const remoteByKey = new Map<string, SyncRow>((data as SyncRow[]).map((row) => [row.key, row]));
  const meta = getSyncMeta();

  for (const key of syncKeys) {
    const remote = remoteByKey.get(key);
    const localMs = meta[key] ?? null;

    if (!remote) {
      // No remote row yet -- either a genuinely fresh store, or this
      // account's first-ever sync of this particular key (existing account,
      // new device, or a key added after the account was created). Only
      // push local data here if it carries a real sync-meta timestamp --
      // i.e. it was actually written while signed in before, just never
      // reached the server (offline, a dropped push, ...). Local data with
      // NO timestamp was written while signed OUT (guest play, see
      // saveAndSync's guard) and must never be adopted as this account's
      // data just because nothing existed on the server yet to compare it
      // against -- that would let guest activity with no relation to this
      // account silently become its cloud data on this account's first
      // sync of a key.
      if (localMs !== null) pendingKeys.add(key);
      continue;
    }

    const remoteMs = new Date(remote.updated_at).getTime();
    if (localMs === null || remoteMs > localMs) {
      if (key === opts.petKey && opts.onPetRow) opts.onPetRow(remote.value, remoteMs);
      else if (key === opts.levelKey && opts.onLevelRow) opts.onLevelRow(remote.value, remoteMs);
      else applyRemoteToLocal(key, remote.value, remoteMs);
    } else if (localMs > remoteMs) {
      pendingKeys.add(key);
    }
  }
  return true;
}
