import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useAppDispatch } from "./AppStateContext";
import { usePet, PET_KEY } from "./PetContext";
import { HISTORY_KEY } from "./history";
import { ACHIEVEMENTS_KEY } from "./achievements";
import { TINGXIE_PROGRESS_KEY } from "./tingxieProgress";
import { LEVEL_KEY, isKnownLevel } from "./levelPreference";
import {
  pullAndMergeAll,
  applyRemoteToLocal,
  clearLocalStore,
  clearSyncMeta,
  resetSyncState,
  markSyncReady
} from "../lib/sync";
import { PET_DEFAULT_STATE } from "../data/pet";
import { DEFAULT_LEVEL, setCurrentLevel } from "../data/levels";
import type { PetState } from "../data/types";

const SYNC_KEYS = [PET_KEY, HISTORY_KEY, ACHIEVEMENTS_KEY, TINGXIE_PROGRESS_KEY, LEVEL_KEY];

// Renders nothing -- mounted inside both AuthProvider and PetProvider (see
// App.tsx) purely so it can read both useAuth() and usePet() in one place,
// plus useAppDispatch() for the level row (see below). Two jobs:
//   1. The moment a genuine sign-out resolves (not the initial "loading" ->
//      "signedOut" resolution when there was never a session this load --
//      that must NOT wipe a guest's local-only progress), wipe every synced
//      store's local copy, the live pet state, the active level (back to
//      DEFAULT_LEVEL), and the sync-meta timestamps that decide merge-pull
//      winners. Without this, the *next* login on this device/tab -- same
//      account or a different one -- would see the signed-out account's
//      leftover data (AuthContext.tsx's signOut() only ends the Supabase
//      session, it never touched local storage), and pullAndMergeAll's
//      last-write-wins merge could even push that leftover data up into the
//      newly-signed-in user's own Supabase row, overwriting their real
//      progress. This is what caused a reported bug where user B signed in
//      right after user A signed out on the same tab and inherited A's
//      pet/history both locally and in her own Supabase row.
//   2. The moment sign-in resolves, run the one-time merge-pull
//      reconciliation against Supabase (see lib/sync.ts's pullAndMergeAll)
//      and route the pet/level rows through their own live-state setters --
//      the two synced stores held in live state (PetContext, AppStateContext)
//      rather than only read lazily on mount by whichever screen needs them,
//      so overwriting localStorage alone wouldn't update what's already on
//      screen/active. Retried on visibility/online until it actually
//      succeeds, and only a genuine success calls lib/sync.ts's
//      markSyncReady() -- opening the gate on a merge that silently failed
//      (offline, or an iPad backgrounding the tab mid-request) is exactly
//      what let a still-default local pet state get pushed up and overwrite
//      a signed-in student's real Supabase row before the merge ever got a
//      chance to pull the real data down. See lib/sync.ts's syncReady
//      comment for the full story.
export function SyncBootstrap() {
  const { status, user } = useAuth();
  const { replacePetState } = usePet();
  const dispatch = useAppDispatch();
  const ranForUserRef = useRef<string | null>(null);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prevStatus !== "signedIn" || status !== "signedOut") return;

    replacePetState({ ...PET_DEFAULT_STATE, lastFedAt: Date.now() });
    clearLocalStore(HISTORY_KEY);
    clearLocalStore(ACHIEVEMENTS_KEY);
    clearLocalStore(TINGXIE_PROGRESS_KEY);
    clearLocalStore(LEVEL_KEY);
    setCurrentLevel(DEFAULT_LEVEL);
    dispatch({ type: "SET_LEVEL", level: DEFAULT_LEVEL });
    clearSyncMeta();
    // Also wipe this module's in-memory pending-push bookkeeping -- without
    // this, a key left over from this account (e.g. one that failed to push
    // while offline) could still be sitting in lib/sync.ts's in-memory
    // pendingKeys/latestValues, and the next signed-in user's own merge could
    // flush it straight into *their* Supabase row. Same cross-account leak
    // clearSyncMeta() exists to prevent, just for the in-memory half.
    resetSyncState();
    // Allow a future sign-in (even by the same account re-logging in) to
    // re-run the merge-pull below instead of being skipped as "already ran
    // for this user id".
    ranForUserRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status !== "signedIn" || !user) return;
    const userId = user.id;
    // Guards the .then() callbacks below against a stale in-flight attempt
    // (e.g. a rapid sign-out then a different sign-in) resolving after this
    // effect's own cleanup has already run for a since-superseded user.
    let cancelled = false;

    function attemptMerge() {
      if (ranForUserRef.current === userId) return;
      void pullAndMergeAll(userId, SYNC_KEYS, {
        petKey: PET_KEY,
        onPetRow: (value) => replacePetState(value as PetState),
        levelKey: LEVEL_KEY,
        // Unlike onPetRow (which routes through replacePetState -> savePetState
        // -> saveAndSync, so the local copy gets persisted as a side effect),
        // there's no equivalent "live state setter that also persists" for
        // level -- so this has to explicitly call applyRemoteToLocal itself
        // (local write + stamp sync-meta to the *remote's* updated_at, no
        // push) on top of updating the live level, or a reload right after
        // login would lose the just-synced level choice (loadSavedLevel()
        // reads localStorage, not live AppState).
        onLevelRow: (value, remoteMs) => {
          if (!isKnownLevel(value)) return;
          applyRemoteToLocal(LEVEL_KEY, value, remoteMs);
          setCurrentLevel(value);
          dispatch({ type: "SET_LEVEL", level: value });
        }
      }).then((succeeded) => {
        if (cancelled || !succeeded) return;
        markSyncReady();
        ranForUserRef.current = userId;
      });
    }

    attemptMerge();
    function onVisible() {
      if (document.visibilityState === "visible") attemptMerge();
    }
    window.addEventListener("online", attemptMerge);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("online", attemptMerge);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // replacePetState is stable across PetProvider's lifetime (defined fresh
    // per render but always the same closure shape); only status/user should
    // retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  return null;
}
