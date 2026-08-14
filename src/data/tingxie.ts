// Data layer for the Tingxie (听写) dictation-practice mode. Lesson content is
// fetched at runtime from public/content/<level>/tingxie/ (not bundled as TS
// imports) so new lessons can be dropped in without a rebuild -- see
// CLAUDE.md's Tingxie section for the full rationale. Content files are YAML,
// parsed with the `yaml` package -- see CLAUDE.md's data-layer section for why
// (structured data with per-word example-sentence lists doesn't fit Markdown
// cleanly, unlike Read a Story's prose).
import YAML from "yaml";
import type {
  TingxieLesson,
  TingxieLessonIndexEntry,
  TingxieSentence,
  TingxieVocabItem
} from "./types";
import { shuffle } from "../lib/shuffle";
import { getCurrentLevel } from "./levels";

function lessonsBase(): string {
  return `${import.meta.env.BASE_URL}content/${getCurrentLevel()}/tingxie`;
}

// Keyed by level (not just "index"/lesson id) so switching levels via the
// level switcher never serves a cached lesson from the previously-active
// level -- see data/levels.ts and data/questions.ts's identical pattern.
const indexCache = new Map<string, TingxieLessonIndexEntry[]>();
const lessonCache = new Map<string, TingxieLesson>();

export async function fetchTingxieLessonIndex(): Promise<TingxieLessonIndexEntry[]> {
  const level = getCurrentLevel();
  const cached = indexCache.get(level);
  if (cached) return cached;
  const res = await fetch(`${lessonsBase()}/index.yaml`);
  if (!res.ok) throw new Error(`加载课程列表失败 Failed to load lesson index (${res.status})`);
  const data = YAML.parse(await res.text()) as TingxieLessonIndexEntry[];
  indexCache.set(level, data);
  return data;
}

export async function fetchTingxieLesson(id: number): Promise<TingxieLesson> {
  const level = getCurrentLevel();
  const cacheKey = `${level}:${id}`;
  const cached = lessonCache.get(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${lessonsBase()}/${id}.yaml`);
  if (!res.ok) throw new Error(`加载课程失败 Failed to load lesson ${id} (${res.status})`);
  const data = YAML.parse(await res.text()) as TingxieLesson;
  lessonCache.set(cacheKey, data);
  return data;
}

// The Play minigame's distractor pool (see components/Tingxie/Play.tsx) --
// deliberately every lesson's vocabulary, not just the lesson being played,
// per the feature request ("different random vocab from any lesson"). Reuses
// fetchTingxieLesson()'s own cache, so this resolves near-instantly once
// prefetchTingxieLessons() (or a previous call to this function) has already
// warmed it -- only a fresh app session with a lesson jumped straight into
// Play before the background prefetch finishes pays a real network cost.
export async function fetchAllTingxieVocabWords(): Promise<string[]> {
  const index = await fetchTingxieLessonIndex();
  const lessons = await Promise.all(index.map((entry) => fetchTingxieLesson(entry.id)));
  const words = new Set<string>();
  for (const lesson of lessons) {
    for (const v of lesson.vocab) words.add(v.word);
  }
  return Array.from(words);
}

// Fire-and-forget warmup: once the lesson index is on screen, quietly fetch
// every lesson's content in the background so a real tap on a lesson number
// resolves from lessonCache instantly instead of waiting on a fresh network
// round trip. Hosted on a real network (unlike the Vite dev server, where
// every one of these fetches is sub-10ms on localhost), each lesson fetch
// can otherwise take a second or more -- this is what closes that gap.
// Errors are swallowed since a failed prefetch just means the eventual real
// click falls back to its own fetch/error handling, same as before this
// existed.
export function prefetchTingxieLessons(index: TingxieLessonIndexEntry[]): void {
  const level = getCurrentLevel();
  for (const entry of index) {
    if (lessonCache.has(`${level}:${entry.id}`)) continue;
    fetchTingxieLesson(entry.id).catch(() => {});
  }
}

// Punctuation tokens that show up as their own entries in TingxieSentence.segments
// -- excluded from the sentence-reordering game's word chips (students order
// words, not punctuation), matching the source app's behavior.
export const TINGXIE_SENTENCE_PUNCTUATION = new Set([
  "，", "。", "！", "？", "、", "：", "；", "“", "”", "…", "——", ",", ".", "!", "?"
]);

// Lucide icon names actually used across all 12 lesson JSON files (verified
// via grep), mapped to an emoji since Lucide/Tailwind are dropped for this
// port. Unmapped future icon names fall back to a generic sparkle.
const TINGXIE_ICON_EMOJI: Record<string, string> = {
  "activity": "🏃", "alert-circle": "❗", "alert-triangle": "⚠️", "book-open": "📖",
  "brain": "🧠", "calendar": "📅", "check": "✅", "check-circle": "✅", "clock": "🕐",
  "cloud-lightning": "⛈️", "cloud-rain": "🌧️", "coffee": "☕", "droplet": "💧",
  "file-text": "📄", "flame": "🔥", "frown": "😟", "ghost": "👻", "gift": "🎁",
  "hand": "✋", "heart": "❤️", "message-square": "💬", "monitor": "🖥️", "phone": "📱",
  "search": "🔍", "shopping-bag": "🛍️", "smile": "😊", "sun": "☀️", "sunset": "🌇",
  "users": "👥", "waves": "🌊", "zap": "⚡"
};

export function tingxieIconEmoji(name: string): string {
  return TINGXIE_ICON_EMOJI[name] ?? "✨";
}

// The sentence-reorder game's word chips -- segments minus punctuation.
export function tingxieSentenceWords(sentence: TingxieSentence): string[] {
  return sentence.segments.filter((s) => !TINGXIE_SENTENCE_PUNCTUATION.has(s));
}

// Literal substring replace (first occurrence), matching the source app's
// blankWord() -- ports directly since it's just string indexOf/slice.
export function tingxieBlankWord(sentence: string, word: string): string {
  const idx = sentence.indexOf(word);
  if (idx === -1) return sentence;
  return sentence.slice(0, idx) + "____" + sentence.slice(idx + word.length);
}

export interface TingxieApplyItem {
  word: string;
  fullSentence: string;
  blanked: string;
  english: string;
  answer: string;
}

export type TingxiePracticeItem =
  | { kind: "vocab"; item: TingxieVocabItem }
  | { kind: "sentence"; item: TingxieSentence };

// One item per vocab word that has bank sentences, each with one randomly
// chosen bank sentence blanked out -- matches the source app's Apply queue
// (not 5x per word; one attempt per word per pass).
export function buildTingxieApplyQueue(vocab: TingxieVocabItem[]): TingxieApplyItem[] {
  const items: TingxieApplyItem[] = [];
  for (const { word, sentenceBank } of vocab) {
    if (!sentenceBank || sentenceBank.length === 0) continue;
    const entry = sentenceBank[Math.floor(Math.random() * sentenceBank.length)];
    items.push({ word, fullSentence: entry.zh, blanked: tingxieBlankWord(entry.zh, word), english: entry.en, answer: word });
  }
  return shuffle(items);
}

export function buildTingxiePracticeVocabQueue(vocab: TingxieVocabItem[]): TingxiePracticeItem[] {
  return shuffle(vocab.map((item) => ({ kind: "vocab" as const, item })));
}

export function buildTingxiePracticeSentenceQueue(sentences: TingxieSentence[]): TingxiePracticeItem[] {
  return shuffle(sentences.map((item) => ({ kind: "sentence" as const, item })));
}

// Custom review sample sizes -- carried over from the source app's pooling
// (up to N items sampled across every selected lesson, not "all of them").
export const TINGXIE_REVIEW_VOCAB_COUNT = 20;
export const TINGXIE_REVIEW_SENTENCE_COUNT = 5;

export function pooledTingxieReview(lessons: TingxieLesson[]): { vocab: TingxieVocabItem[]; sentences: TingxieSentence[]; applyVocab: TingxieVocabItem[] } {
  const allVocab = lessons.flatMap((l) => l.vocab);
  const allSentences = lessons.flatMap((l) => l.sentences);
  return {
    vocab: shuffle(allVocab).slice(0, TINGXIE_REVIEW_VOCAB_COUNT),
    sentences: shuffle(allSentences).slice(0, TINGXIE_REVIEW_SENTENCE_COUNT),
    // Uncapped, unlike `vocab` above -- Apply's blank-fill queue pools every
    // selected lesson's bank sentences in full, deliberately not limited to
    // the same 20-word sample shown in Learn's flip-card carousel.
    applyVocab: allVocab
  };
}
