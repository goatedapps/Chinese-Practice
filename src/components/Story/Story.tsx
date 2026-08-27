import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { fetchStoryIndex, fetchStoryLesson, prefetchStoryLessons, segmentSentences, type StoryIndex, type StoryLesson } from "../../data/stories";
import { speakText, stopSpeaking } from "../../lib/speech";
import { usePet } from "../../state/PetContext";
import { STORY_COMPLETE_BP_AWARD } from "../../data/pet";
import { Sound } from "../../lib/sound";
import { CompleteScreen } from "../common/CompleteScreen";
import { Icon } from "../common/Icons";
import { logAchievement } from "../../state/achievements";
import { recordTodayStoryRead } from "../../state/todaySummary";

type StoryView = "picker" | "reading" | "complete";

// "Read a Story" mode: pick a lesson, then flip through its passage one
// page at a time. Deliberately simple local state (plain useState, no
// reducer/Context) -- unlike Tingxie, there's no queue mechanic or multiple
// activities to coordinate, just "which lesson" and "which page". Lesson
// content is fetched at runtime (data/stories.ts) rather than a static
// import, so the picker/reader both need a loading state -- same
// dispatch-a-fetch-on-mount idiom as Tingxie's LessonSelect.tsx.
export function Story() {
  const dispatch = useAppDispatch();
  const { awardBP } = usePet();
  const [view, setView] = useState<StoryView>("picker");
  const [segmentIndex, setSegmentIndex] = useState(0);

  const [storyIndex, setStoryIndex] = useState<StoryIndex | null>(null);
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);

  const [lesson, setLesson] = useState<StoryLesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Stop any in-progress read-aloud whenever the student changes lesson,
  // segment, or leaves this screen entirely -- same lingering-speech fix as
  // Quiz.tsx's dictation button / Tingxie's shell-level stopSpeaking().
  useEffect(() => {
    stopSpeaking();
    return stopSpeaking;
  }, [view, lesson, segmentIndex]);

  function loadIndex() {
    setIndexLoading(true);
    setIndexError(null);
    fetchStoryIndex()
      .then((index) => {
        setStoryIndex(index);
        setIndexLoading(false);
        prefetchStoryLessons(index);
      })
      .catch((err: Error) => {
        setIndexError(err.message);
        setIndexLoading(false);
      });
  }

  useEffect(() => {
    if (storyIndex) return;
    loadIndex();
    // Runs once on mount; retry button below re-fetches explicitly on click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openLesson(id: number) {
    setSegmentIndex(0);
    setLessonError(null);
    setLessonLoading(true);
    fetchStoryLesson(id)
      .then((l) => {
        setLesson(l);
        setLessonLoading(false);
        setView("reading");
      })
      .catch((err: Error) => {
        setLessonError(err.message);
        setLessonLoading(false);
      });
  }

  function backToPicker() {
    setView("picker");
    setLesson(null);
  }

  // Fires once per "我读完了 Finish Reading" tap on the story's last page
  // (see StoryReader below) -- Read a Story otherwise stays independent of
  // the Quiz/history/Today's Mission pipeline (no HistoryEntry, no mission
  // credit), but a finish does log a "storyCompleted" achievement (shown in
  // Home's Recent Achievements) and a same-day record for the "今日学习总结
  // Today's Session Summary" PDF (see state/todaySummary.ts), on top of its
  // BP award.
  function finishStory() {
    if (lesson === null) return;
    awardBP(STORY_COMPLETE_BP_AWARD);
    logAchievement({ type: "storyCompleted", detail: String(lesson.id) });
    recordTodayStoryRead(lesson.id);
    Sound.applause();
    setView("complete");
  }

  if (view === "reading" && lesson !== null) {
    return (
      <StoryReader
        lesson={lesson}
        segmentIndex={segmentIndex}
        onSegmentChange={setSegmentIndex}
        onExit={backToPicker}
        onFinish={finishStory}
      />
    );
  }

  if (view === "complete" && lesson !== null) {
    return (
      <div className="screen story-screen">
        <CompleteScreen title={`《${lesson.title}》读完了！Story Complete!`} bpAmount={STORY_COMPLETE_BP_AWARD}>
          <div className="action-row">
            <button className="primary-btn" onClick={backToPicker}>
              ← 返回课文列表 Back to Lessons
            </button>
          </div>
        </CompleteScreen>
      </div>
    );
  }

  return (
    <div className="screen story-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        <span className="back-btn-arrow">←</span>
        <span className="back-btn-label">返回 Back</span>
      </button>
      <h1 className="page-header">
        <Icon name="sparkle" className="page-header-spark" />
        <img className="page-header-icon" src="/icons/read.png" alt="" />
        读故事 Read a Story
        <Icon name="sparkle" className="page-header-spark" />
      </h1>
      <p className="picker-hint">
        <span className="en">Choose a lesson to read its story.</span>
      </p>

      {indexLoading && <p className="tingxie-loading">加载中... Loading...</p>}
      {indexError && (
        <div className="tingxie-error">
          <p>{indexError}</p>
          <button className="secondary-btn" onClick={loadIndex}>
            重试 Retry
          </button>
        </div>
      )}
      {lessonError && <p className="tingxie-error-inline">{lessonError}</p>}
      {lessonLoading && <p className="tingxie-loading">加载课文中... Loading story...</p>}

      {storyIndex && (
        <div className="lesson-grid">
          {Array.from({ length: storyIndex.lessonCount }, (_, i) => i + 1).map((id) => {
            const isPlaceholder = !storyIndex.written.includes(id);
            return (
              <button key={id} className="lesson-btn" disabled={lessonLoading} onClick={() => openLesson(id)}>
                <div className="lesson-btn-num">{`第 ${id} 课`}</div>
                {isPlaceholder && <div className="lesson-btn-count">敬请期待 Coming soon</div>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StoryReaderProps {
  lesson: StoryLesson;
  segmentIndex: number;
  onSegmentChange: (index: number) => void;
  onExit: () => void;
  onFinish: () => void;
}

// Duration (ms) of each half of the page-flip animation -- kept as one JS
// constant rather than hardcoded separately in the CSS, and passed down via
// an inline `animationDuration` style (same pattern as CatchGame's
// sweepDuration/FeatherGame's fallDuration) so the flipTo() timer that
// actually advances the page and the CSS animation that visualizes it can
// never drift out of sync.
const FLIP_MS = 260;

type FlipState = { direction: "next" | "prev"; phase: "out" | "in" };

// A separate top-level component (not nested inside Story()) so its
// component identity stays stable across Story's re-renders -- nesting it
// would give React a new component type every render and force a full
// remount, wiping segmentSpeaking/flip state each time. Same reasoning as
// Quiz.tsx's PassageBox being defined outside Quiz().
function StoryReader({ lesson, segmentIndex, onSegmentChange, onExit, onFinish }: StoryReaderProps) {
  const segment = lesson.segments[segmentIndex];
  const [segmentSpeaking, setSegmentSpeaking] = useState(false);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The segment-dictation toggle needs resetting on every page flip --
  // StoryReader isn't remounted per page, so a stale "speaking" flag from
  // the previous page would otherwise survive the flip.
  useEffect(() => {
    setSegmentSpeaking(false);
  }, [segmentIndex]);

  // A pending flip timer must not fire after the student navigates away
  // mid-animation (e.g. clicking "Back to Lessons" during the flip) --
  // otherwise it'd call onSegmentChange/setFlip on a page the student has
  // already left.
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  function toggleSegment() {
    if (segmentSpeaking) {
      stopSpeaking();
      setSegmentSpeaking(false);
    } else {
      setSegmentSpeaking(true);
      // onDone fires whether the reading finishes on its own or gets
      // interrupted (stopSpeaking() above, a sentence's own dictation click
      // below, or navigating away) -- either way this button's state stays
      // in sync, same pattern as Quiz.tsx's PassageBox.
      speakText(segmentSentences(segment).join(""), () => setSegmentSpeaking(false));
    }
  }

  function readSentence(sentence: string) {
    // Reset immediately rather than waiting on the segment utterance's own
    // onDone -- speakText() cancels it internally anyway, but this keeps the
    // Stop button's visual state from lagging behind the click.
    setSegmentSpeaking(false);
    speakText(sentence);
  }

  // Two-phase flip: the current page rotates away ("out"), then -- once
  // that finishes -- the page index actually advances and the new page
  // rotates into place ("in"). Using one content slot with a sequenced
  // out/in pair (rather than rendering two full pages layered on top of
  // each other) keeps this simple; see the CSS for how each phase looks.
  function flipTo(direction: "next" | "prev") {
    if (flip) return; // ignore taps mid-flip
    setFlip({ direction, phase: "out" });
    flipTimeoutRef.current = setTimeout(() => {
      onSegmentChange(segmentIndex + (direction === "next" ? 1 : -1));
      setFlip({ direction, phase: "in" });
      flipTimeoutRef.current = setTimeout(() => setFlip(null), FLIP_MS);
    }, FLIP_MS);
  }

  const isFirst = segmentIndex === 0;
  const isLast = segmentIndex === lesson.segments.length - 1;
  const flipClass = flip ? ` story-page-flip-${flip.direction}-${flip.phase}` : "";

  return (
    <div className="screen story-screen story-reading">
      <button className="back-btn" onClick={onExit}>
        <span className="back-btn-arrow">←</span>
        <span className="back-btn-label">返回课文列表 Back to Lessons</span>
      </button>
      <h1>{lesson.title}</h1>
      <div className="story-page-indicator">{`第 ${segmentIndex + 1} / ${lesson.segments.length} 页`}</div>

      <div className="story-page-flipper">
        <div className={"story-page" + flipClass} style={{ animationDuration: `${FLIP_MS}ms` }}>
          <div className="story-page-head">
            <button
              type="button"
              className={"dictation-btn" + (segmentSpeaking ? " dictation-btn-active" : "")}
              title={segmentSpeaking ? "停止朗读 Stop reading" : "朗读本段 Read this part"}
              aria-label={segmentSpeaking ? "停止朗读 Stop reading" : "朗读本段 Read this part"}
              onClick={toggleSegment}
            >
              {segmentSpeaking ? "⏹ 停止 Stop" : "🔊 朗读本段"}
            </button>
          </div>
          <div className="story-text">
            {segment.paragraphs.map((paragraph, pi) => (
              <p key={pi} className="story-paragraph">
                {paragraph.map((sentence, si) => (
                  <button
                    key={si}
                    type="button"
                    className="story-sentence"
                    title="朗读这句 Read this sentence"
                    onClick={() => readSentence(sentence)}
                  >
                    {sentence}
                  </button>
                ))}
              </p>
            ))}
          </div>

          {/* Real content's last page offers a "Finish Reading" action (BP
              award, see Story()'s finishStory()) instead of a next-page
              curl -- a placeholder "coming soon" stub has nothing to
              actually finish, so it gets neither. */}
          {isLast && !lesson.placeholder && (
            <div className="action-row story-finish-row">
              <button type="button" className="primary-btn" onClick={onFinish}>
                🎉 我读完了 Finish Reading
              </button>
            </div>
          )}

          {/* Book-style page-turn affordance: a curled corner instead of a
              plain "Next"/"Prev" button. Bottom-right flips forward,
              bottom-left flips back -- each only rendered when that
              direction actually goes somewhere (no wraparound). */}
          {!isLast && (
            <button
              type="button"
              className="story-page-curl story-page-curl-next"
              title="下一页 Next page"
              aria-label="下一页 Next page"
              disabled={flip !== null}
              onClick={() => flipTo("next")}
            />
          )}
          {!isFirst && (
            <button
              type="button"
              className="story-page-curl story-page-curl-prev"
              title="上一页 Previous page"
              aria-label="上一页 Previous page"
              disabled={flip !== null}
              onClick={() => flipTo("prev")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
