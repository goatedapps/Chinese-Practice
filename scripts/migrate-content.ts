// One-off migration: converts the legacy TS/JSON content (src/data/questions.ts,
// src/data/stories.ts, public/tingxie-lessons/*.json) into the new
// public/content/p5/** YAML/Markdown files described in CLAUDE.md's data-layer
// section. Run once via `npx tsx scripts/migrate-content.ts`; safe to delete
// once the migration is verified and the legacy files are removed.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { CATEGORIES, LESSON_COUNT, QUESTION_GROUPS } from "../src/data/questions";
import { STORY_LESSONS } from "../src/data/stories";
import { buildContentIndex } from "./build-content-index";

const YAML_OPTS = { lineWidth: 0 };
const ROOT = process.cwd();
const LEVEL_DIR = join(ROOT, "public", "content", "p5");

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function stripQuestion(q: Record<string, unknown>): Record<string, unknown> {
  const { qNo: _qNo, ...rest } = q;
  return rest;
}

function stripGroup(g: Record<string, unknown>): Record<string, unknown> {
  const { paper: _paper, section: _section, lessonEligible: _lessonEligible, questions, ...rest } = g;
  return { ...rest, questions: (questions as Record<string, unknown>[]).map(stripQuestion) };
}

function migrateQuestions(): void {
  const questionsDir = join(LEVEL_DIR, "questions");
  ensureDir(questionsDir);

  for (const key of Object.keys(CATEGORIES)) {
    const groups = QUESTION_GROUPS.filter((g) => g.category === key).map((g) => stripGroup(g as unknown as Record<string, unknown>));
    writeFileSync(join(questionsDir, `${key}.yaml`), YAML.stringify(groups, YAML_OPTS));
  }

  writeFileSync(join(LEVEL_DIR, "meta.yaml"), YAML.stringify({ label: "Primary 5", lessonCount: LESSON_COUNT }, YAML_OPTS));
}

function storyToMarkdown(lesson: { title: string; segments: { paragraphs: string[][] }[] }): string {
  const lines: string[] = [`# ${lesson.title}`, ""];
  lesson.segments.forEach((seg, i) => {
    lines.push(`## Page ${i + 1}`, "");
    for (const para of seg.paragraphs) {
      lines.push(para.join("\n"), "");
    }
  });
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function migrateStories(): void {
  const storiesDir = join(LEVEL_DIR, "stories");
  ensureDir(storiesDir);

  for (let id = 1; id <= LESSON_COUNT; id++) {
    const lesson = STORY_LESSONS[id];
    if (!lesson || lesson.placeholder) continue;
    writeFileSync(join(storiesDir, `${id}.md`), storyToMarkdown(lesson));
  }
}

function migrateTingxie(): void {
  const srcDir = join(ROOT, "public", "tingxie-lessons");
  const destDir = join(LEVEL_DIR, "tingxie");
  ensureDir(destDir);

  const files = readdirSync(srcDir).filter((f) => f.endsWith(".json") && f !== "index.json");
  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(srcDir, file), "utf8"));
    const bank: Record<string, unknown[]> = raw.sentenceBank ?? {};
    const vocab = (raw.vocab as Record<string, unknown>[]).map((v) => {
      const entries = bank[v.word as string];
      return entries && entries.length > 0 ? { ...v, sentenceBank: entries } : { ...v };
    });
    const sentences = (raw.sentences as Record<string, unknown>[]).map((s) => {
      const { color: _color, ...rest } = s;
      return rest;
    });
    const id = file.replace(/\.json$/, "");
    writeFileSync(join(destDir, `${id}.yaml`), YAML.stringify({ title: raw.title, vocab, sentences }, YAML_OPTS));
  }
}

migrateQuestions();
migrateStories();
migrateTingxie();
buildContentIndex("p5", join(ROOT, "public", "content"));

console.log("Migration complete.");
