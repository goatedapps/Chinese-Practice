// Data for the "Read a Story" mode (components/Story/) -- one illustrated-
// story-style passage per lesson, broken into pages ("segments") that the
// reader flips through one at a time, plus each page broken into individual
// sentences so a student can tap just one sentence to hear it in isolation.
// Unlike Tingxie's lesson content (fetched at runtime from
// public/tingxie-lessons/*.json), this is small enough to bundle directly as
// TS data -- no need for the fetch-on-demand pattern.
//
// Sentence splitting is done by hand when authoring a lesson's `segments`,
// not by a runtime regex splitter -- Chinese dialogue punctuation (a “…”
// quote spanning multiple sentence-ending marks) doesn't split cleanly with
// a generic rule, so each lesson's sentence boundaries are a one-time
// authorial choice baked into the data.
import { LESSON_COUNT } from "./questions";

// A page groups one or more of the original story's paragraphs -- every page
// should have at least 3 sentences (a short paragraph on its own would make
// too sparse a page), so short consecutive paragraphs are merged onto the
// same page while a paragraph boundary itself is always preserved for
// rendering (each renders as its own <p>, see StoryReader). This means a
// page is *not* always exactly one paragraph, unlike the very first version
// of this data.
export interface StorySegment {
  paragraphs: string[][]; // each inner array is one paragraph's sentences
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

export function segmentSentences(segment: StorySegment): string[] {
  return segment.paragraphs.flat();
}

function placeholderLesson(id: number): StoryLesson {
  return {
    id,
    title: `第 ${id} 课的故事`,
    placeholder: true,
    // Not held to the "at least 3 sentences per page" guideline that applies
    // to real authored lessons below -- it's stub content, not something
    // meant to be read as an actual passage.
    segments: [{ paragraphs: [["这篇课文即将推出，请稍候。This story is coming soon — check back later."]] }]
  };
}

const LESSON_1: StoryLesson = {
  id: 1,
  title: "消失的“宝物”",
  segments: [
    {
      paragraphs: [
        ["暑假到了，学校组织去森林露营、探险和攀岩。"],
        ["出发前老师提醒：“带好袜子和手电筒来防止蚊虫。", "绝对不能单独行动，也禁止带贵重物品！”"]
      ]
    },
    {
      paragraphs: [
        ["到了营地，大家集合参加两人三足竞赛。"],
        ["“我们一定要拿冠军！”", "小强兴奋地把我的脚和他绑在一起。"]
      ]
    },
    {
      paragraphs: [
        ["“没问题，齐心协力，互相配合！”", "我大喊。"],
        ["比赛中，小强不小心摔倒了。", "大家轮流扶起他，他擦干汗水，继续往前冲。", "那一刻我感到无比自豪。"]
      ]
    },
    {
      paragraphs: [
        ["玩累后，面对香喷喷的排骨，大家狼吞虎咽，很快吃完了一顿饭。"],
        ["突然，小强尖叫：“糟了！", "我的‘贵重宝物’掉了！”"]
      ]
    },
    {
      paragraphs: [
        [
          "这可是违规的！",
          "大家赶紧陪他在黄昏时分寻找。",
          "来到一望无际的海边，夕阳映着高高的椰树，小强终于在树下翻出一个盒子。"
        ]
      ]
    },
    {
      paragraphs: [
        ["“找到了！”", "他松了一口气。"],
        ["大家凑近一看，里面竟然是一根啃得干干净净的排骨骨头！", "小强不好意思地笑：“这是我妈妈做的，我想留着当零食……”"],
        ["大家先是一愣，随即哈哈大笑，这真是一次难忘的经历！"]
      ]
    }
  ]
};

// Every lesson number from 1 to LESSON_COUNT (data/questions.ts -- the same
// 17-lesson organization the rest of the app uses) always has an entry here,
// real or placeholder, so screens never need to null-check a missing lesson.
export const STORY_LESSONS: Record<number, StoryLesson> = { 1: LESSON_1 };
for (let id = 2; id <= LESSON_COUNT; id++) {
  STORY_LESSONS[id] = placeholderLesson(id);
}
