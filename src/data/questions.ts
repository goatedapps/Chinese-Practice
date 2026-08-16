/* =========================================================
   QUESTION DATABASE for the Chinese Practice app.
   Content itself lives in public/content/<level>/questions/ (one YAML file
   per category, plus a lightweight index.yaml) -- see CLAUDE.md's data-layer
   section for the file format and authoring convention. This module is just
   the loader: CATEGORIES/SUBJECTS/VOCABULARY_CATEGORY_KEYS are stable app
   config (not per-level content), and fetchQuestionIndex()/
   fetchQuestionCategory() fetch+cache the actual question data at runtime,
   same fetch-on-demand pattern as data/tingxie.ts/data/stories.ts.
   parseQuestionCategoryYaml() is the pure YAML-text -> QuestionGroup[]
   parser shared with scripts/build-content-index.ts (Node has no fetch-able
   public/ URL, so the script reads the file itself and calls this directly)
   -- keeps the index builder's validation identical to the runtime loader's.

   A "group" is either:
     - a standalone single question (passage: null), or
     - a passage plus every question that shares it -- these are
       always presented together, never split apart.
   ========================================================= */
import YAML from "yaml";
import type { Category, MCQOption, Passage, Question, QuestionGroup, QuestionIndexEntry } from "./types";
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

// Categories whose question bank file uses the flat single-question shape
// (questionID/lessonIds/question/options/correct -- no groupId/subject/
// category/passage/marks/format) instead of the passage-group shape every
// other category uses. Every group in these 6 categories was verified to
// always be subject:Chinese, format:MCQ, marks:2, passage:null, exactly one
// question -- so those fields are never authored here, just synthesized
// back on load (see expandFlatRecord()).
const FLAT_CATEGORIES = new Set(["pinyin", "vocab", "phrase", "usage", "conjunction", "sentence"]);

// Passage-group categories where `subject`/`format` is constant across every
// group in the file today (verified categorically against the actual data,
// not just per-group) -- so the source YAML omits it and this fills the
// default back in on load. cloze/comprehension have no entry here since
// Chinese/Higher Chinese and MCQ/Fill-in/Long-Answer/Writing-Constrained are
// genuinely mixed within those two files, so `subject`/`format` stay
// required per-group/per-question fields there.
const CATEGORY_DEFAULT_SUBJECT: Partial<Record<string, string>> = {
  dialogue: "Chinese",
  errorcorrect: "Higher Chinese",
  practical: "Chinese"
};
const CATEGORY_DEFAULT_FORMAT: Partial<Record<string, string>> = {
  dialogue: "MCQ",
  errorcorrect: "Fill-in"
};
// Every question across every category is marks:2 except a handful of
// comprehension/practical Long-Answer/Writing-Constrained items -- so marks
// is always optional in the source YAML, defaulting to 2 when omitted,
// regardless of category (no per-category table needed, unlike
// subject/format above).
const DEFAULT_MARKS = 2;

function toOptions(list: string[]): MCQOption[] {
  return list.map((text, i) => ({ key: String(i + 1), text }));
}

function findOptionKey(options: MCQOption[], correctText: string, where: string): string {
  const match = options.find((o) => o.text === correctText);
  if (!match) throw new Error(`"correct" value "${correctText}" does not match any option (${where})`);
  return match.key;
}

interface RawFlatRecord {
  questionID: string;
  lessonIds: number[];
  question: string;
  options: string[];
  correct: string;
}

function expandFlatRecord(category: string, raw: RawFlatRecord): Omit<QuestionGroup, "lessonEligible"> {
  const options = toOptions(raw.options);
  const correctKey = findOptionKey(options, raw.correct, raw.questionID);
  return {
    groupId: raw.questionID,
    subject: "Chinese",
    category,
    lessonIds: raw.lessonIds,
    passage: null,
    questions: [
      { qNo: "", marks: DEFAULT_MARKS, format: "MCQ", text: raw.question, options, correctKey } as Question
    ]
  };
}

interface RawGroupQuestion {
  marks?: number;
  format?: string;
  text: string;
  context?: string;
  notes?: string;
  options?: string[]; // MCQ with its own options -- omitted when the group's optionBank is used instead
  correct?: string; // MCQ only -- matches an option's (own or bank) text
  accepted?: string[]; // Fill-in only
  displayAnswer?: string; // Fill-in / Long-Answer / Writing-Constrained
}

interface RawGroup {
  groupId: string;
  subject?: string;
  lessonIds: number[];
  passage: Passage | null;
  optionBank?: string[];
  questions: RawGroupQuestion[];
}

function expandGroup(category: string, raw: RawGroup): Omit<QuestionGroup, "lessonEligible"> {
  const subject = raw.subject ?? CATEGORY_DEFAULT_SUBJECT[category];
  if (!subject) throw new Error(`Group "${raw.groupId}" (${category}) is missing "subject" and this category has no default`);
  const optionBank = raw.optionBank ? toOptions(raw.optionBank) : undefined;

  const questions = raw.questions.map((rq): Question => {
    const format = rq.format ?? CATEGORY_DEFAULT_FORMAT[category];
    if (!format) throw new Error(`A question in group "${raw.groupId}" (${category}) is missing "format" and this category has no default`);
    const marks = rq.marks ?? DEFAULT_MARKS;
    const base = { qNo: "", marks, text: rq.text, context: rq.context, notes: rq.notes };

    if (format === "MCQ") {
      const options = rq.options ? toOptions(rq.options) : undefined;
      const bank = options ?? optionBank;
      if (!bank) throw new Error(`MCQ question in group "${raw.groupId}" has no options and the group has no optionBank`);
      if (rq.correct === undefined) throw new Error(`MCQ question in group "${raw.groupId}" is missing "correct"`);
      const correctKey = findOptionKey(bank, rq.correct, raw.groupId);
      return { ...base, format: "MCQ", options, correctKey } as Question;
    }
    if (format === "Fill-in") {
      return { ...base, format: "Fill-in", accepted: rq.accepted ?? [], displayAnswer: rq.displayAnswer ?? "" } as Question;
    }
    // Long-Answer / Writing-Constrained
    return { ...base, format: format as "Long-Answer" | "Writing-Constrained", displayAnswer: rq.displayAnswer ?? "" } as Question;
  });

  return { groupId: raw.groupId, subject, category, lessonIds: raw.lessonIds, passage: raw.passage, optionBank, questions };
}

// Pure YAML-text -> QuestionGroup[] parser (no fetch, no cache) -- shared by
// fetchQuestionCategory() below and scripts/build-content-index.ts, so the
// index-rebuild script gets the exact same expansion/validation (e.g. a
// "correct" typo that doesn't match any option throws in both places) rather
// than a second hand-maintained copy of this logic.
export function parseQuestionCategoryYaml(category: string, yamlText: string): QuestionGroup[] {
  const raw = YAML.parse(yamlText) as unknown[];
  const expanded = FLAT_CATEGORIES.has(category)
    ? (raw as RawFlatRecord[]).map((r) => expandFlatRecord(category, r))
    : (raw as RawGroup[]).map((g) => expandGroup(category, g));
  return expanded.map((g) => ({
    ...g,
    lessonEligible: g.lessonIds.length > 0,
    questions: g.questions.map((q, i) => ({ ...q, qNo: `${g.groupId}-${i}` }))
  }));
}

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
// only when a quiz session actually needs them. Parsing/expansion (synthesizing
// qNo/lessonEligible, filling in category defaults, resolving MCQ correctKey)
// happens in parseQuestionCategoryYaml() above -- this just fetches+caches.
export async function fetchQuestionCategory(category: string): Promise<QuestionGroup[]> {
  const level = getCurrentLevel();
  const cacheKey = `${level}:${category}`;
  const cached = categoryCache.get(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${contentBase()}/questions/${category}.yaml`);
  if (!res.ok) throw new Error(`加载题目失败 Failed to load "${category}" questions (${res.status})`);
  const data = parseQuestionCategoryYaml(category, await res.text());
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
