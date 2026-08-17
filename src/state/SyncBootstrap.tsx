import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { usePet, PET_KEY } from "./PetContext";
import { HISTORY_KEY } from "./history";
import { ACHIEVEMENTS_KEY } from "./achievements";
import { TINGXIE_PROGRESS_KEY } from "./tingxieProgress";
import { pullAndMergeAll, clearLocalStore, clearSyncMeta } from "../lib/sync";
import { PET_DEFAULT_STATE } from "../data/pet";
import type { PetState } from "../data/types";

const SYNC_KEYS = [PET_KEY, HISTORY_KEY, ACHIEVEMENTS_KEY, TINGXIE_PROGRESS_KEY];

// Renders nothing -- mounted inside both AuthProvider and PetProvider (see
// App.tsx) purely so it can read both useAuth() and usePet() in one place.
// Two jobs, both keyed off status transitions:
//   1. The moment sign-in resolves, run the one-time merge-pull
//      reconciliation against Supabase (see lib/sync.ts's pullAndMergeAll)
//      and route the pet row through usePet().replacePetState -- the only
//      synced store held in live React state, so overwriting localStorage
//      alone wouldn't update what's already on screen. Every other synced
//      store is read lazily on mount by its own screen, so a plain
//      localStorage overwrite is enough for those.
//   2. The moment a genuine sign-out resolves (not the initial "loading" ->
//      "signedOut" resolution when there was never a session this load --
//      that must NOT wipe a guest's local-only progress), wipe every synced
//      store's local copy, the live pet state, and the sync-meta timestamps
//      that decide merge-pull winners. Without this, the *next* login on
//      this device/tab -- same account or a different one -- would see the
//      signed-out account's leftover data (AuthContext.tsx's signOut() only
//      ends the Supabase session, it never touched local storage), and
//      pullAndMergeAll's last-write-wins merge could even push that
//      leftover data up into the newly-signed-in user's own Supabase row,
//      overwriting their real progress. This is what caused a reported bug
//      where user B signed in right after user A signed out on the same
//      tab and inherited A's pet/history both locally and in her own
//      Supabase row.
export function SyncBootstrap() {
  const { status, user } = useAuth();
  const { replacePetState } = usePet();
  const ranForUserRef = useRef<string | null>(null);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prevStatus === "signedIn" && status === "signedOut") {
      replacePetState({ ...PET_DEFAULT_STATE, lastFedAt: Date.now() });
      clearLocalStore(HISTORY_KEY);
      clearLocalStore(ACHIEVEMENTS_KEY);
      clearLocalStore(TINGXIE_PROGRESS_KEY);
      clearSyncMeta();
      // Allow a future sign-in (even by the same account re-logging in) to
      // re-run the merge-pull below instead of being skipped as "already ran
      // for this user id".
      ranForUserRef.current = null;
    }

    if (status !== "signedIn" || !user) return;
    if (ranForUserRef.current === user.id) return;
    ranForUserRef.current = user.id;

    void pullAndMergeAll(user.id, SYNC_KEYS, {
      petKey: PET_KEY,
      onPetRow: (value) => replacePetState(value as PetState)
    });
    // replacePetState is stable across PetProvider's lifetime (defined fresh
    // per render but always the same closure shape); only status/user should
    // retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  return null;
}
