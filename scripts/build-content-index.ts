// Regenerates public/content/<level>/{questions,tingxie,stories}/index.yaml from
// the individual content files. Run this after hand-editing any content file so
// the lightweight index used by the app's pickers stays in sync:
//   npx tsx scripts/build-content-index.ts [level]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

const YAML_OPTS = { lineWidth: 0 };

export function buildContentIndex(level: string, contentBaseDir: string): void {
  const levelDir = join(contentBaseDir, level);
  buildQuestionsIndex(join(levelDir, "questions"));
  buildTingxieIndex(join(levelDir, "tingxie"));
  buildStoriesIndex(join(levelDir, "stories"));
}

function buildQuestionsIndex(dir: string): void {
  const files = readdirSync(dir).filter((f) => f.endsWith(".yaml") && f !== "index.yaml");
  const index: unknown[] = [];
  for (const file of files) {
    const groups = YAML.parse(readFileSync(join(dir, file), "utf8")) as Array<{
      groupId: string;
      subject: string;
      category: string;
      lessonIds: number[];
      questions: unknown[];
    }>;
    for (const g of groups) {
      index.push({
        groupId: g.groupId,
        subject: g.subject,
        category: g.category,
        lessonIds: g.lessonIds,
        questionCount: g.questions.length
      });
    }
  }
  writeFileSync(join(dir, "index.yaml"), YAML.stringify(index, YAML_OPTS));
}

function buildTingxieIndex(dir: string): void {
  const files = readdirSync(dir).filter((f) => f.endsWith(".yaml") && f !== "index.yaml");
  const index = files
    .map((file) => {
      const id = Number(file.replace(/\.yaml$/, ""));
      const lesson = YAML.parse(readFileSync(join(dir, file), "utf8")) as { title: string };
      return { id, title: lesson.title };
    })
    .sort((a, b) => a.id - b.id);
  writeFileSync(join(dir, "index.yaml"), YAML.stringify(index, YAML_OPTS));
}

function buildStoriesIndex(dir: string): void {
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const written = files.map((f) => Number(f.replace(/\.md$/, ""))).sort((a, b) => a - b);
  writeFileSync(join(dir, "index.yaml"), YAML.stringify({ written }, YAML_OPTS));
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/build-content-index.ts");
if (isMain) {
  const level = process.argv[2] ?? "p5";
  buildContentIndex(level, join(process.cwd(), "public", "content"));
  console.log(`Rebuilt content index for level "${level}".`);
}
