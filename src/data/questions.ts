/* =========================================================
   QUESTION DATABASE for the Chinese Practice app.
   Content itself lives in public/content/<level>/questions/ (one YAML file
   per category, plus a lightweight index.yaml) -- see CLAUDE.md's data-layer
   section for the file format and authoring convention. This module is just
   the loader: CATEGORIES/SUBJECTS/VOCABULARY_CATEGORY_KEYS are stable app
   config (not per-level content), and fetchQuestionIndex()/
   fetchQuestionCategory() fetch+cache the actual question data at runtime,
   same fetch-on-demand pattern as data/tingxie.ts/data/stories.ts.

   A "group" is either:
     - a standalone single question (passage: null), or
     - a passage plus every question that shares it -- these are
       always presented together, never split apart.
   ========================================================= */
import YAML from "yaml";
import type { Category, QuestionGroup, QuestionIndexEntry } from "./types";
import { getCurrentLevel } from "./levels";

// Coarse categories used for the "practice by type" picker.
// lessonMode:true  -> single-sentence items, eligible for "practice by lesson"
// lessonMode:false -> passage-based items, only offered under "practice by type"
export const CATEGORIES: Record<string, Category> = {
  pinyin:        { label: "汉语拼音 Hanyu Pinyin",              lessonMode: true  },
  vocab:         { label: "词语运用 Vocabulary",                 lessonMode: true  },
  phrase:        { label: "词语释义 Phrase Meaning",             lessonMode: true  },
  conjunction:   { label: "关联词 Conjunctions",                 lessonMode: true  },
  sentence:      { label: "句子填空 Sentence Completion",        lessonMode: true  },
  usage:         { label: "正确运用选择 Correct Usage",          lessonMode: true  },
  cloze:         { label: "完形填空 Cloze Passage",              lessonMode: false },
  errorcorrect:  { label: "改错 Error Correction",               lessonMode: false },
  comprehension: { label: "阅读理解 Reading Comprehension",      lessonMode: false },
  dialogue:      { label: "完成对话 Dialogue Completion",        lessonMode: false },
  practical:     { label: "应用文阅读 Practical Text / Notice",  lessonMode: false }
};

// The 4 categories the Practice screen combines into one "词语运用 Vocabulary"
// button (see Practice.tsx's TYPE_PICKER_GROUPS) -- also exactly the set of
// categories whose lessonIds were actually verified against a real per-lesson
// vocab list (see CLAUDE.md's lessonIds note), which is why lesson-filtering
// on the Practice screen only ever applies to these four, never to
// conjunction/sentence.
export const VOCABULARY_CATEGORY_KEYS: string[] = ["pinyin", "vocab", "phrase", "usage"];

export const SUBJECTS: string[] = ["Chinese", "Higher Chinese"];

function contentBase(): string {
  return `${import.meta.env.BASE_URL}content/${getCurrentLevel()}`;
}

export interface QuestionMeta {
  label: string;
  lessonCount: number;
}

// Every cache below is keyed by level (not just by category/"index"/"meta")
// so switching levels via the level switcher (see components/common/
// LevelBar.tsx) never serves one level's cached content under another --
// the app is an SPA, so these module-level Maps otherwise outlive a level
// switch.
const metaCache = new Map<string, QuestionMeta>();
const indexCache = new Map<string, QuestionIndexEntry[]>();
const categoryCache = new Map<string, QuestionGroup[]>();

export async function fetchQuestionMeta(): Promise<QuestionMeta> {
  const level = getCurrentLevel();
  const cached = metaCache.get(level);
  if (cached) return cached;
  const res = await fetch(`${contentBase()}/meta.yaml`);
  if (!res.ok) throw new Error(`加载课程信息失败 Failed to load level info (${res.status})`);
  const data = YAML.parse(await res.text()) as QuestionMeta;
  metaCache.set(level, data);
  return data;
}

// Lightweight per-group metadata for every group in this level -- used by
// picker screens (Practice.tsx's lesson-count grid, AppStateContext's
// SELECT_SUBJECT category filtering) that need to know what's available
// without fetching every category's full passage/question/answer content.
export async function fetchQuestionIndex(): Promise<QuestionIndexEntry[]> {
  const level = getCurrentLevel();
  const cached = indexCache.get(level);
  if (cached) return cached;
  const res = await fetch(`${contentBase()}/questions/index.yaml`);
  if (!res.ok) throw new Error(`加载题库索引失败 Failed to load question index (${res.status})`);
  const data = YAML.parse(await res.text()) as QuestionIndexEntry[];
  indexCache.set(level, data);
  return data;
}

// Full resolved groups (passage/questions/answers) for one category, fetched
// only when a quiz session actually needs them. `qNo` isn't authored in the
// source file (it was a pure display/correlation id, never read back out of
// the data -- see CLAUDE.md) so it's synthesized here per question.
// `lessonEligible` is likewise not authored -- it's fully redundant with
// lessonIds, so it's computed here too.
export async function fetchQuestionCategory(category: string): Promise<QuestionGroup[]> {
  const level = getCurrentLevel();
  const cacheKey = `${level}:${category}`;
  const cached = categoryCache.get(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${contentBase()}/questions/${category}.yaml`);
  if (!res.ok) throw new Error(`加载题目失败 Failed to load "${category}" questions (${res.status})`);
  const raw = YAML.parse(await res.text()) as Array<Omit<QuestionGroup, "lessonEligible" | "questions"> & { questions: Array<Record<string, unknown>> }>;
  const data: QuestionGroup[] = raw.map((g) => ({
    ...g,
    lessonEligible: g.lessonIds.length > 0,
    questions: g.questions.map((q, i) => ({ ...q, qNo: `${g.groupId}-${i}` })) as QuestionGroup["questions"]
  }));
  categoryCache.set(cacheKey, data);
  return data;
}

// Fire-and-forget warmup, same reasoning/pattern as data/tingxie.ts's
// prefetchTingxieLessons()/data/stories.ts's prefetchStoryLessons() -- called
// once from App.tsx right after the bootstrap index lands, so every
// category's full content is already sitting in categoryCache by the time
// the student actually picks question types and hits "开始练习 Start
// Practice". Doesn't change the documented lazy-load contract (the bootstrap
// fetch itself still only loads the lightweight index, see CLAUDE.md) --
// this just warms the cache in the background afterward, non-blocking.
// Always warms whatever getCurrentLevel() is *right now* -- safe to call
// again after a level switch, since the cache key above already scopes each
// fetch to its own level.
export function prefetchAllQuestionCategories(): void {
  const level = getCurrentLevel();
  for (const category of Object.keys(CATEGORIES)) {
    if (categoryCache.has(`${level}:${category}`)) continue;
    fetchQuestionCategory(category).catch(() => {});
  }
}

// Which subjects actually have at least one group of a given category --
// derived from the index (not hand-maintained) so it can never drift out of
// sync with the real data. Used by Practice.tsx to grey out question types
// that don't exist for the selected subject (e.g. Higher Chinese has no
// pinyin/vocab/phrase/usage/conjunction/sentence/dialogue/practical groups --
// only cloze/errorcorrect/comprehension).
export function computeCategorySubjects(index: QuestionIndexEntry[]): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  for (const key of Object.keys(CATEGORIES)) map[key] = new Set();
  for (const entry of index) map[entry.category]?.add(entry.subject);
  return map;
}
