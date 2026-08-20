import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { setSyncUser, flushAllNow } from "../lib/sync";
import { normalizeUsername, isValidUsername, usernameToEmail, emailToUsername } from "../lib/username";
import { loadJSON, saveJSON } from "../lib/storage";

export type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  // True once the student has explicitly chosen to skip login (Auth.tsx's
  // "Continue as Guest") -- persisted so the App.tsx login gate (see below)
  // never re-nags a device that's already made this choice. Independent of
  // `status`/sign-out: once set, it stays set for this device.
  isGuest: boolean;
  signUp: (username: string, password: string) => Promise<{ error?: string }>;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const USERNAME_ERROR = "Username must be 3-20 letters, numbers, _ or -";
const GUEST_MODE_KEY = "hanyuPracticeGuestMode_v1";

const AuthCtx = createContext<AuthContextValue | null>(null);

// Login resolves in the background and never blocks *this* provider's own
// render -- but App.tsx's ScreenRouter DOES wait for `status` to leave
// "loading" before deciding whether to show the forced login gate (see
// App.tsx), so a signed-in student on a fresh page load doesn't flash the
// login screen before their session is confirmed.
export function AuthProvider({ children }: { children: ReactNode }) {
  // No Supabase configured (see lib/supabase.ts) -- stay permanently
  // signed-out, never even attempt a session lookup.
  const [status, setStatus] = useState<AuthStatus>(supabase ? "loading" : "signedOut");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => loadJSON(GUEST_MODE_KEY, false));

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    function applySession(session: { user: { id: string; email?: string } } | null) {
      if (session?.user) {
        setUser({ id: session.user.id, username: emailToUsername(session.user.email ?? "") });
        setStatus("signedIn");
        setSyncUser(session.user.id);
      } else {
        setUser(null);
        setStatus("signedOut");
        setSyncUser(null);
      }
    }

    client.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => applySession(session));
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signUp(username: string, password: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Login isn't configured yet" };
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) return { error: USERNAME_ERROR };
    const { error } = await supabase.auth.signUp({ email: usernameToEmail(normalized), password });
    // Supabase's generic "already registered" error text talks about email --
    // reword so it makes sense in a username-only UI.
    if (error?.message.toLowerCase().includes("already registered")) return { error: "Username is already taken" };
    return error ? { error: error.message } : {};
  }

  async function signIn(username: string, password: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Login isn't configured yet" };
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) return { error: USERNAME_ERROR };
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(normalized), password });
    return error ? { error: "Incorrect username or password" } : {};
  }

  async function signOut(): Promise<void> {
    // Push every still-pending local change up to Supabase FIRST, before the
    // session actually ends -- otherwise a write still sitting in its 2s
    // debounce window at the moment of logout would simply be discarded (the
    // Supabase session ends, then SyncBootstrap.tsx's sign-out effect wipes
    // local storage a moment later, so that in-flight change is lost for
    // good on both sides). flushAllNow() awaits real network pushes (with a
    // timeout safety net), so this can take a moment -- callers should show
    // a "signing out..." state rather than assume this resolves instantly.
    //
    // Ending the Supabase session itself only stops future syncing --
    // clearing this account's local data (every synced store, the live pet
    // state, and the sync-meta timestamps) happens in state/SyncBootstrap.tsx,
    // reacting to the resulting signedIn -> signedOut transition, since
    // that's the one place with access to both this Context and PetContext
    // (AuthProvider sits above PetProvider in App.tsx's tree, so it can't
    // call usePet() itself). See SyncBootstrap.tsx for why that clearing is
    // required, not optional -- without it, the next login on this
    // device/tab (same or a different account) inherits this account's
    // leftover local data, and the merge-pull can even push it into that
    // next account's own Supabase row. Does not clear isGuest, though -- a
    // student who already made the guest-vs-login decision once shouldn't be
    // forced through the login gate again just because they signed out of
    // an account.
    if (!supabase) return;
    await flushAllNow();
    await supabase.auth.signOut();
  }

  function continueAsGuest(): void {
    setIsGuest(true);
    saveJSON(GUEST_MODE_KEY, true);
  }

  return (
    <AuthCtx.Provider value={{ status, user, isGuest, signUp, signIn, signOut, continueAsGuest }}>{children}</AuthCtx.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
