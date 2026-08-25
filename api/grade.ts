import type { VercelRequest, VercelResponse } from "@vercel/node";

// A current free-tier "Flash" model as of writing -- Google renames/retires
// free-tier models periodically, so re-check aistudio.google.com if grading
// starts failing with a 404/model-not-found from Gemini.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = 8000;

interface GradeRequestBody {
  questionText: string;
  displayAnswer: string;
  studentAnswer: string;
  marks: number;
  context?: string;
}

function isValidBody(body: unknown): body is GradeRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.questionText === "string" &&
    typeof b.displayAnswer === "string" &&
    typeof b.studentAnswer === "string" &&
    typeof b.marks === "number" &&
    Number.isInteger(b.marks) &&
    b.marks > 0 &&
    (b.context === undefined || typeof b.context === "string")
  );
}

function buildPrompt(body: GradeRequestBody): string {
  return `你是一位小学语文老师，请批改学生的开放式问答题。

题目 Question: ${body.questionText}
${body.context ? `补充说明/评分标准 Rubric: ${body.context}\n` : ""}参考答案 Model answer: ${body.displayAnswer}
学生作答 Student's answer: ${body.studentAnswer}

请给出 0 到 ${body.marks} 分之间的整数分数（该题满分 ${body.marks} 分），根据学生作答实际包含了多少参考答案/评分标准中的要点来评分，不要求逐字相同。
同时给出反馈：用简单、容易读懂的中文，具体指出作答可以如何改进（不要只写"对"或"错"，也不要只是重复参考答案）。

请严格输出 JSON：{"score": <0-${body.marks}的整数>, "feedback": "<反馈，不超过50字>"}`;
}

class RateLimitedError extends Error {}

async function callGemini(apiKey: string, prompt: string, maxScore: number): Promise<{ score: number; feedback: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                score: { type: "INTEGER" },
                feedback: { type: "STRING" }
              },
              required: ["score", "feedback"]
            }
          }
        }),
        signal: controller.signal
      }
    );
    if (res.status === 429) throw new RateLimitedError();
    if (!res.ok) return null;
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") return null;
    const parsed = JSON.parse(text);
    if (typeof parsed.score !== "number" || !Number.isInteger(parsed.score) || typeof parsed.feedback !== "string") {
      return null;
    }
    if (parsed.score < 0 || parsed.score > maxScore) return null;
    return { score: parsed.score, feedback: parsed.feedback };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const allowlist = process.env.AI_GRADING_USER_IDS;
  if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey || !allowlist) {
    res.status(500).json({ error: "misconfigured" });
    return;
  }

  // Piggyback on Supabase's own token verification rather than pulling in a
  // JWT library + the project's JWT secret (a second, more sensitive secret
  // to manage/rotate).
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` }
  });
  if (!userRes.ok) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const user = (await userRes.json()) as { id?: string };
  const eligibleIds = allowlist.split(",").map((s) => s.trim());
  if (!user.id || !eligibleIds.includes(user.id)) {
    res.status(403).json({ error: "not_eligible" });
    return;
  }

  if (!isValidBody(req.body)) {
    res.status(400).json({ error: "bad_request" });
    return;
  }
  const body = req.body;

  let result: { score: number; feedback: string } | null;
  try {
    result = await callGemini(geminiApiKey, buildPrompt(body), body.marks);
  } catch (err) {
    if (err instanceof RateLimitedError) {
      res.status(429).json({ error: "rate_limited" });
      return;
    }
    if (err instanceof Error && err.name === "AbortError") {
      res.status(504).json({ error: "upstream_timeout" });
      return;
    }
    res.status(502).json({ error: "upstream_error" });
    return;
  }

  if (!result) {
    res.status(502).json({ error: "upstream_error" });
    return;
  }

  res.status(200).json({
    correct: result.score > 0,
    score: result.score,
    feedback: result.feedback.slice(0, 300)
  });
}
