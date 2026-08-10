import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { setSyncUser } from "../lib/sync";
import { normalizeUsername, isValidUsername, usernameToEmail, emailToUsername } from "../lib/username";

export type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  signUp: (username: string, password: string) => Promise<{ error?: string }>;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const USERNAME_ERROR = "用户名需为 3-20 位英文字母、数字、下划线或短横线 Username must be 3-20 letters, numbers, _ or -";

const AuthCtx = createContext<AuthContextValue | null>(null);

// Login is entirely optional and resolves in the background -- nothing in
// App.tsx blocks rendering on `status === "loading"` (unlike the question-
// index bootstrap gate), since local data already renders instantly
// regardless of auth state. This context only ever decides whether
// state/SyncBootstrap.tsx has something to reconcile in the background.
export function AuthProvider({ children }: { children: ReactNode }) {
  // No Supabase configured (see lib/supabase.ts) -- stay permanently
  // signed-out, never even attempt a session lookup.
  const [status, setStatus] = useState<AuthStatus>(supabase ? "loading" : "signedOut");
  const [user, setUser] = useState<AuthUser | null>(null);

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
    if (!supabase) return { error: "登录暂未配置 Login isn't configured yet" };
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) return { error: USERNAME_ERROR };
    const { error } = await supabase.auth.signUp({ email: usernameToEmail(normalized), password });
    // Supabase's generic "already registered" error text talks about email --
    // reword so it makes sense in a username-only UI.
    if (error?.message.toLowerCase().includes("already registered")) return { error: "用户名已被使用 Username is already taken" };
    return error ? { error: error.message } : {};
  }

  async function signIn(username: string, password: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "登录暂未配置 Login isn't configured yet" };
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) return { error: USERNAME_ERROR };
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(normalized), password });
    return error ? { error: "用户名或密码不正确 Incorrect username or password" } : {};
  }

  async function signOut(): Promise<void> {
    // Deliberately does not touch localStorage -- signing out only stops
    // future syncing, the device's own local progress stays fully usable
    // (see CLAUDE.md's Auth / cross-device sync section).
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return <AuthCtx.Provider value={{ status, user, signUp, signIn, signOut }}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
