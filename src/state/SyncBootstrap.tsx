import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { usePet, PET_KEY } from "./PetContext";
import { HISTORY_KEY } from "./history";
import { ACHIEVEMENTS_KEY } from "./achievements";
import { TINGXIE_PROGRESS_KEY } from "./tingxieProgress";
import { pullAndMergeAll } from "../lib/sync";
import type { PetState } from "../data/types";

const SYNC_KEYS = [PET_KEY, HISTORY_KEY, ACHIEVEMENTS_KEY, TINGXIE_PROGRESS_KEY];

// Renders nothing -- mounted inside both AuthProvider and PetProvider (see
// App.tsx) purely so it can read both useAuth() and usePet() in one place.
// The one job here: the moment sign-in resolves, run the one-time merge-pull
// reconciliation against Supabase (see lib/sync.ts's pullAndMergeAll) and
// route the pet row through usePet().replacePetState -- the only synced
// store held in live React state, so overwriting localStorage alone
// wouldn't update what's already on screen. Every other synced store is
// read lazily on mount by its own screen, so a plain localStorage overwrite
// is enough for those.
export function SyncBootstrap() {
  const { status, user } = useAuth();
  const { replacePetState } = usePet();
  const ranForUserRef = useRef<string | null>(null);

  useEffect(() => {
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
