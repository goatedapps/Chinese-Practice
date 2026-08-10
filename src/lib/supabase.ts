import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Login/sync are entirely optional -- the app must keep working fully
// offline/local exactly as before if these env vars aren't configured (e.g.
// before Supabase is set up, or a build that deliberately omits them). Every
// caller (AuthContext, lib/sync.ts) checks for `null` and no-ops rather than
// this module throwing at import time.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
