import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import { STORY_LESSONS, segmentSentences } from "../../data/stories";
import { LESSON_COUNT } from "../../data/questions";
import { speakText, stopSpeaking } from "../../lib/speech";

type StoryView = "picker" | "reading";

const LESSON_IDS = Array.from({ length: LESSON_COUNT }, (_, i) => i + 1);

// "Read a Story" mode: pick a lesson, then flip through its passage one
// page at a time. Deliberately simple local state (plain useState, no
// reducer/Context) -- unlike Tingxie, there's no queue mechanic or multiple
// activities to coordinate, just "which lesson" and "which page".
export function Story() {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<StoryView>("picker");
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);

  // Stop any in-progress read-aloud whenever the student changes lesson,
  // segment, or leaves this screen entirely -- same lingering-speech fix as
  // Quiz.tsx's dictation button / Tingxie's shell-level stopSpeaking().
  useEffect(() => {
    stopSpeaking();
    return stopSpeaking;
  }, [view, lessonId, segmentIndex]);

  function openLesson(id: number) {
    setLessonId(id);
    setSegmentIndex(0);
    setView("reading");
  }

  function backToPicker() {
    setView("picker");
    setLessonId(null);
  }

  if (view === "reading" && lessonId !== null) {
    return (
      <StoryReader
        lessonId={lessonId}
        segmentIndex={segmentIndex}
        onSegmentChange={setSegmentIndex}
        onExit={backToPicker}
      />
    );
  }

  return (
    <div className="screen story-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        ← 返回 Back
      </button>
      <h1>读故事 Read a Story</h1>
      <p className="picker-hint">
        <span className="en">Choose a lesson to read its story.</span>
      </p>
      <div className="lesson-grid">
        {LESSON_IDS.map((id) => {
          const lesson = STORY_LESSONS[id];
          return (
            <button key={id} className="lesson-btn" onClick={() => openLesson(id)}>
              <div className="lesson-btn-num">{`第 ${id} 课`}</div>
              {lesson.placeholder && <div className="lesson-btn-count">敬请期待 Coming soon</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface StoryReaderProps {
  lessonId: number;
  segmentIndex: number;
  onSegmentChange: (index: number) => void;
  onExit: () => void;
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
function StoryReader({ lessonId, segmentIndex, onSegmentChange, onExit }: StoryReaderProps) {
  const lesson = STORY_LESSONS[lessonId];
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
        ← 返回课文列表 Back to Lessons
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
