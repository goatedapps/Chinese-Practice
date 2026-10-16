import { createContentCache } from "../lib/contentCache";
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
// button (see Practice.tsx's TYPE_PICKER_GROUP_DEFS) -- also exactly the set of
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

const cacheMeta = createContentCache<QuestionMeta>();
const cacheIndex = createContentCache<QuestionIndexEntry[]>();
const cacheCategory = createContentCache<QuestionGroup[]>();

export function fetchQuestionMeta(): Promise<QuestionMeta> {
  const level = getCurrentLevel();
  const base = contentBase();
  return cacheMeta(level, async () => {
    const [res, { parse }] = await Promise.all([fetch(`${base}/meta.yaml`), import("yaml")]);
    if (!res.ok) throw new Error(`加载课程信息失败 Failed to load level info (${res.status})`);
    return parse(await res.text()) as QuestionMeta;
  });
}

export function fetchQuestionIndex(): Promise<QuestionIndexEntry[]> {
  const level = getCurrentLevel();
  const base = contentBase();
  return cacheIndex(level, async () => {
    const [res, { parse }] = await Promise.all([fetch(`${base}/questions/index.yaml`), import("yaml")]);
    if (!res.ok) throw new Error(`加载题库索引失败 Failed to load question index (${res.status})`);
    return parse(await res.text()) as QuestionIndexEntry[];
  });
}

export function fetchQuestionCategory(category: string): Promise<QuestionGroup[]> {
  const level = getCurrentLevel();
  const base = contentBase();
  return cacheCategory(`${level}:${category}`, async () => {
    const [res, { parseQuestionCategoryYaml }] = await Promise.all([fetch(`${base}/questions/${category}.yaml`), import("./questionSchema")]);
    if (!res.ok) throw new Error(`加载题目失败 Failed to load "${category}" questions (${res.status})`);
    return parseQuestionCategoryYaml(category, await res.text());
  });
}

// Subject/category availability comes from the loaded level's index.
export function computeCategorySubjects(index: QuestionIndexEntry[]): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  for (const key of Object.keys(CATEGORIES)) map[key] = new Set();
  for (const entry of index) map[entry.category]?.add(entry.subject);
  return map;
}
