// Keep authored sentence boundaries intact for sentence-by-sentence speech.
import { parse as parseYaml } from "yaml";
import { createContentCache } from "../lib/contentCache";
import { getCurrentLevel } from "./levels";

function contentBase(): string {
  return `${import.meta.env.BASE_URL}content/${getCurrentLevel()}`;
}

export interface StorySegment {
  paragraphs: string[][]; // each inner array is one paragraph's sentences
  illustration?: { src: string; alt: string };
}

export interface StoryLesson {
  id: number;
  title: string;
  segments: StorySegment[];
  // True for a lesson whose real story hasn't been written yet -- see
  // placeholderLesson() below. Lets the lesson picker show a "coming soon"
  // badge without needing a separate "does this lesson have content" check.
  placeholder?: boolean;
}

export interface StoryIndex {
  lessonCount: number;
  written: number[];
  lessons?: { id: number; title: string; pageCount: number }[];
}

export function segmentSentences(segment: StorySegment): string[] {
  return segment.paragraphs.flat();
}

function placeholderLesson(id: number): StoryLesson {
  return {
    id,
    title: `第 ${id} 课的故事`,
    placeholder: true,
    // Not held to the "at least 3 sentences per page" guideline that applies
    // to real authored lessons -- it's stub content, not something meant to
    // be read as an actual passage.
    segments: [{ paragraphs: [["这篇课文即将推出，请稍候。This story is coming soon — check back later."]] }]
  };
}

// Parses one lesson's Markdown file (see CLAUDE.md for the authoring
// convention): a leading `# Title`, then one `## Page N` section per page,
// blank-line-separated paragraph blocks within a page, one hand-split
// sentence per line within a paragraph block.
export function parseStoryMarkdown(id: number, text: string, imageBase = ""): StoryLesson {
  const titleMatch = text.match(/^#\s+(.+)\s*$/m);
  const title = titleMatch ? titleMatch[1].trim() : `第 ${id} 课`;

  const pageChunks = text.split(/^##\s+Page\s+\d+\s*$/m).slice(1);
  const segments: StorySegment[] = pageChunks.map((chunk) => {
    let illustration: StorySegment["illustration"];
    const prose = chunk.replace(/^!\[([^\]]*)\]\(([^\s)]+)\)\s*$/gm, (_, alt: string, src: string) => {
      illustration = { alt, src: src.startsWith("/") ? src : `${imageBase}${src}` };
      return "";
    });
    const paragraphBlocks = prose
      .trim()
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter((block) => block.length > 0);
    const paragraphs = paragraphBlocks.map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    );
    return { paragraphs, illustration };
  });

  return { id, title, segments };
}

const cacheIndex = createContentCache<StoryIndex>();
const cacheLesson = createContentCache<StoryLesson>();

function fetchIndexForLevel(level: string, base: string): Promise<StoryIndex> {
  return cacheIndex(level, async () => {
    const [metaRes, writtenRes] = await Promise.all([fetch(`${base}/meta.yaml`), fetch(`${base}/stories/index.yaml`)]);
    if (!metaRes.ok || !writtenRes.ok) throw new Error("加载课文列表失败 Failed to load story index");
    const meta = parseYaml(await metaRes.text()) as { lessonCount: number };
    const written = parseYaml(await writtenRes.text()) as Omit<StoryIndex, "lessonCount">;
    return { lessonCount: meta.lessonCount, ...written };
  });
}

export function fetchStoryIndex(): Promise<StoryIndex> {
  return fetchIndexForLevel(getCurrentLevel(), contentBase());
}

export function fetchStoryLesson(id: number): Promise<StoryLesson> {
  const level = getCurrentLevel();
  const base = contentBase();
  return cacheLesson(`${level}:${id}`, async () => {
    const index = await fetchIndexForLevel(level, base);
    if (!index.written.includes(id)) return placeholderLesson(id);
    const res = await fetch(`${base}/stories/${id}.md`);
    if (!res.ok) throw new Error(`加载课文失败 Failed to load story ${id} (${res.status})`);
    return parseStoryMarkdown(id, await res.text(), `${base}/stories/`);
  });
}
