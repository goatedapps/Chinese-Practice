import { supabase } from "./supabase";

export interface AiGradeResult {
  correct: boolean; // true iff score > 0 -- this is what drives BP awarding
  score: number; // 0..marks
  feedback: string; // simple Chinese, points out how to improve
}

// Calls /api/grade for one self-check question. Returns null on ANY failure
// (no session, network error, timeout, non-2xx, 403 not-eligible, malformed
// JSON) -- callers always treat null as "fall back to manual self-check,"
// never surface it as an error. The allowlist check itself lives entirely
// server-side (api/grade.ts) -- this function doesn't try to guess
// eligibility client-side, it just attempts the call and accepts a 403 as
// one more reason to fall back.
export async function gradeSelfCheckWithAI(params: {
  questionText: string;
  context?: string;
  passage?: string;
  displayAnswer: string;
  studentAnswer: string;
  marks: number;
}): Promise<AiGradeResult | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(params),
      signal: controller.signal
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (typeof json.correct !== "boolean" || typeof json.score !== "number" || typeof json.feedback !== "string") {
      return null;
    }
    return { correct: json.correct, score: json.score, feedback: json.feedback };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
