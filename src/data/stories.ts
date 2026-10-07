// Keep authored sentence boundaries intact for sentence-by-sentence speech.
import YAML from "yaml";
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

// Keyed by level so switching levels via the level switcher never serves a
// cached story from the previously-active level -- see data/levels.ts and
// data/questions.ts's identical pattern.
const indexCache = new Map<string, StoryIndex>();
const lessonCache = new Map<string, StoryLesson>();

export async function fetchStoryIndex(): Promise<StoryIndex> {
  const level = getCurrentLevel();
  const cached = indexCache.get(level);
  if (cached) return cached;
  const base = contentBase();
  const [metaRes, writtenRes] = await Promise.all([fetch(`${base}/meta.yaml`), fetch(`${base}/stories/index.yaml`)]);
  if (!metaRes.ok || !writtenRes.ok) throw new Error("加载课文列表失败 Failed to load story index");
  const meta = YAML.parse(await metaRes.text()) as { lessonCount: number };
  const written = YAML.parse(await writtenRes.text()) as { written: number[] };
  const data: StoryIndex = { lessonCount: meta.lessonCount, written: written.written };
  indexCache.set(level, data);
  return data;
}

export async function fetchStoryLesson(id: number): Promise<StoryLesson> {
  const level = getCurrentLevel();
  const base = contentBase();
  const cacheKey = `${level}:${id}`;
  const cached = lessonCache.get(cacheKey);
  if (cached) return cached;
  const index = await fetchStoryIndex();
  if (!index.written.includes(id)) {
    const lesson = placeholderLesson(id);
    lessonCache.set(cacheKey, lesson);
    return lesson;
  }
  const res = await fetch(`${base}/stories/${id}.md`);
  if (!res.ok) throw new Error(`加载课文失败 Failed to load story ${id} (${res.status})`);
  const lesson = parseStoryMarkdown(id, await res.text(), `${base}/stories/`);
  lessonCache.set(cacheKey, lesson);
  return lesson;
}

// Fire-and-forget warmup, same reasoning/pattern as data/tingxie.ts's
// prefetchTingxieLessons() -- fetches every written lesson's Markdown in the
// background once the picker's index is up, so a real tap on a lesson number
// resolves from lessonCache instantly instead of paying a fresh network
// round trip (which, on a real hosted connection rather than the Vite dev
// server, is where the noticeable "Loading story..." delay comes from).
export function prefetchStoryLessons(index: StoryIndex): void {
  const level = getCurrentLevel();
  for (const id of index.written) {
    if (lessonCache.has(`${level}:${id}`)) continue;
    fetchStoryLesson(id).catch(() => {});
  }
}
