// One-off migration: rewrites public/content/<level>/questions/*.yaml from the
// old groupId/subject/category/marks/format/keyed-options shape into the
// leaner shape described in CLAUDE.md's Content files section -- flat
// questionID/lessonIds/question/options/correct records for the 6 uniform
// "flat" categories, and trimmed (default-omitting) groups for the 5
// passage-bearing categories. Already run for p5 and p2; kept for reference
// (same convention as migrate-content.ts) in case a future level's content
// still needs converting from the old shape.
//   npx tsx scripts/migrate-question-schema.ts [level]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

const YAML_OPTS = { lineWidth: 0 };

const FLAT_CATEGORIES = new Set(["pinyin", "vocab", "phrase", "usage", "conjunction", "sentence"]);
const CATEGORY_DEFAULT_SUBJECT: Partial<Record<string, string>> = {
  dialogue: "Chinese",
  errorcorrect: "Higher Chinese",
  practical: "Chinese"
};
const CATEGORY_DEFAULT_FORMAT: Partial<Record<string, string>> = {
  dialogue: "MCQ",
  errorcorrect: "Fill-in"
};
const DEFAULT_MARKS = 2;

interface OldOption { key: string; text: string; }
interface OldQuestion {
  marks: number;
  format: string;
  text: string;
  context?: string;
  notes?: string;
  options?: OldOption[];
  correctKey?: string;
  accepted?: string[];
  displayAnswer?: string;
}
interface OldGroup {
  groupId: string;
  subject: string;
  category: string;
  lessonIds: number[];
  passage: unknown;
  optionBank?: OldOption[];
  questions: OldQuestion[];
}

function optionText(options: OldOption[] | undefined, key: string | undefined, where: string): string {
  const match = options?.find((o) => o.key === key);
  if (!match) throw new Error(`No option with key "${key}" in ${where}`);
  return match.text;
}

function migrateFlatFile(groups: OldGroup[]): unknown[] {
  return groups.map((g) => {
    const q = g.questions[0];
    if (g.questions.length !== 1) throw new Error(`${g.groupId}: expected exactly 1 question in a flat category`);
    return {
      questionID: g.groupId,
      lessonIds: g.lessonIds,
      question: q.text,
      options: (q.options ?? []).map((o) => o.text),
      correct: optionText(q.options, q.correctKey, g.groupId)
    };
  });
}

function migrateGroupFile(category: string, groups: OldGroup[]): unknown[] {
  return groups.map((g) => {
    const out: Record<string, unknown> = { groupId: g.groupId };
    if (g.subject !== CATEGORY_DEFAULT_SUBJECT[category]) out.subject = g.subject;
    out.lessonIds = g.lessonIds;
    out.passage = g.passage;
    if (g.optionBank) out.optionBank = g.optionBank.map((o) => o.text);

    out.questions = g.questions.map((q) => {
      const oq: Record<string, unknown> = {};
      if (q.marks !== DEFAULT_MARKS) oq.marks = q.marks;
      if (q.format !== CATEGORY_DEFAULT_FORMAT[category]) oq.format = q.format;
      oq.text = q.text;
      if (q.context) oq.context = q.context;
      if (q.notes) oq.notes = q.notes;

      if (q.format === "MCQ") {
        if (q.options) {
          oq.options = q.options.map((o) => o.text);
          oq.correct = optionText(q.options, q.correctKey, `${g.groupId} (own options)`);
        } else {
          oq.correct = optionText(g.optionBank, q.correctKey, `${g.groupId} (optionBank)`);
        }
      } else if (q.format === "Fill-in") {
        oq.accepted = q.accepted;
        oq.displayAnswer = q.displayAnswer;
      } else {
        // Long-Answer / Writing-Constrained
        oq.displayAnswer = q.displayAnswer;
      }
      return oq;
    });

    return out;
  });
}

function migrateQuestionsDir(dir: string): void {
  const files = readdirSync(dir).filter((f) => f.endsWith(".yaml") && f !== "index.yaml");
  for (const file of files) {
    const category = file.replace(/\.yaml$/, "");
    const groups = YAML.parse(readFileSync(join(dir, file), "utf8")) as OldGroup[];
    const migrated = FLAT_CATEGORIES.has(category) ? migrateFlatFile(groups) : migrateGroupFile(category, groups);
    writeFileSync(join(dir, file), YAML.stringify(migrated, YAML_OPTS));
    console.log(`  ${file}: ${groups.length} group(s) migrated`);
  }
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/migrate-question-schema.ts");
if (isMain) {
  const level = process.argv[2] ?? "p5";
  const dir = join(process.cwd(), "public", "content", level, "questions");
  console.log(`Migrating question schema for level "${level}"...`);
  migrateQuestionsDir(dir);
  console.log("Done.");
}
