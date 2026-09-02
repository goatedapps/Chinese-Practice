import { useEffect, useRef, useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { useAuth } from "../../state/AuthContext";
import { BP_AWARD } from "../../data/pet";
import { RichText } from "../../lib/richText";
import { Sound } from "../../lib/sound";
import { speakText, stopSpeaking } from "../../lib/speech";
import { gradeGroup, correctOptionFor, isSelfCheckFormat } from "../../lib/grading";
import { BpAmount } from "../common/BpAmount";
import type { AnswerMap } from "../../lib/grading";
import { gradeSelfCheckWithAI } from "../../lib/aiGrading";
import type { Question, QuestionGroup, GroupResultItem, Passage, SelfCheckQuestion } from "../../data/types";

export function Quiz() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { awardBP } = usePet();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const group = state.groups[state.groupIndex];
  const bpMultiplier = state.reducedBP ? 0.5 : 1;
  function awardBPScaled(base: number) {
    awardBP(Math.round(base * bpMultiplier));
  }

  function clearAutoAdvance() {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setAutoAdvancing(false);
  }

  // Fresh answers for each new group -- avoids answers bleeding across groups.
  useEffect(() => {
    setAnswers({});
    clearAutoAdvance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.groupIndex]);

  // Cancel any pending auto-advance if the student navigates away mid-timer.
  useEffect(() => clearAutoAdvance, []);

  // Stop any in-progress read-aloud the moment the student leaves this group
  // (submitting moves them from question to feedback; NEXT_GROUP moves them
  // to a new question entirely) -- otherwise a reading started via the 🔊
  // button keeps playing over content the student has already moved past.
  // Also stops it if the student leaves Quiz entirely (unmount).
  useEffect(() => {
    stopSpeaking();
    return stopSpeaking;
  }, [state.groupIndex]);

  // Guards against groupIndex running past the end of the session.
  useEffect(() => {
    if (!group) dispatch({ type: "GO_TO_SCREEN", screen: "result" });
  }, [group, dispatch]);

  if (!group) return null;

  const currentRecord = state.submitted ? state.results[state.groupIndex] : null;
  const hasPendingAi = currentRecord?.items.some((it) => it.aiGrading === "pending") ?? false;
  const priorQuestionCount = state.groups
    .slice(0, state.groupIndex)
    .reduce((sum, g) => sum + g.questions.length, 0);

  function setAnswer(qNo: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qNo]: value }));
  }

  function goNext() {
    clearAutoAdvance();
    dispatch({ type: "NEXT_GROUP" });
  }

  function handleSubmit() {
    stopSpeaking();
    const graded = gradeGroup(group, answers);
    // AI grading is attempted for any logged-in user (family or not) -- the
    // server-side allowlist in api/grade.ts is the real gate, this is just
    // what decides whether to show a "pending" state at all. Guests have no
    // session token, so gradeSelfCheckWithAI would no-op anyway, but skipping
    // it here means they never see a pending flash either.
    const items = user
      ? graded.map((item, idx) =>
          // A blank self-check answer is already auto-marked wrong by
          // gradeQuestion() (skipped: true) -- nothing for the AI to grade.
          isSelfCheckFormat(group.questions[idx].format) && !item.skipped
            ? { ...item, aiGrading: "pending" as const }
            : item
        )
      : graded;
    let dingCount = 0;
    items.forEach((item, idx) => {
      const q = group.questions[idx];
      if (q.format === "MCQ" || q.format === "Fill-in") {
        if (item.correct) {
          Sound.ding(dingCount++ * 0.14);
          awardBPScaled(BP_AWARD[q.format]);
        } else if (!item.skipped) {
          // Silent on a skipped/unanswered question -- only a genuine wrong
          // answer gets the miss sound.
          Sound.miss();
        }
      }
    });
    dispatch({ type: "SUBMIT_GROUP", record: { groupId: group.groupId, items } });

    const groupIndex = state.groupIndex;
    items.forEach((item, idx) => {
      if (item.aiGrading !== "pending") return;
      const q = group.questions[idx] as SelfCheckQuestion;
      gradeSelfCheckWithAI({
        questionText: q.text,
        context: q.context,
        passage: group.passage?.text,
        displayAnswer: q.displayAnswer,
        studentAnswer: answers[q.qNo] ?? "",
        marks: q.marks
      }).then((result) => {
        if (!result) {
          dispatch({ type: "UPDATE_ITEM_RESULT", groupIndex, qNo: q.qNo, patch: { aiGrading: "failed" } });
          return;
        }
        const patch: Partial<GroupResultItem> = {
          correct: result.correct,
          skipped: false,
          aiGrading: "done",
          aiScore: result.score,
          aiFeedback: result.feedback
        };
        if (result.correct) {
          patch.bpAwarded = true;
          awardBPScaled(BP_AWARD[q.format] ?? 2);
          Sound.ding(0);
        } else {
          Sound.miss();
        }
        dispatch({ type: "UPDATE_ITEM_RESULT", groupIndex, qNo: q.qNo, patch });
      });
    });

    // Only skip the manual click when every item graded correct outright --
    // anything wrong/skipped, or a self-check item (correct: null until the
    // student clicks a self-check button, or an AI verdict lands), needs
    // their eyes on it first.
    if (items.every((it) => it.correct === true)) {
      setAutoAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        autoAdvanceTimerRef.current = null;
        dispatch({ type: "NEXT_GROUP" });
      }, 800);
    }
  }

  function handleSelfCheck(qNo: string, format: string, correct: boolean) {
    const item = currentRecord?.items.find((it) => it.qNo === qNo);
    const patch: Partial<GroupResultItem> = { correct, skipped: false };
    if (correct && !item?.bpAwarded) {
      patch.bpAwarded = true;
      awardBPScaled(BP_AWARD[format] ?? 2);
      Sound.ding(0);
    } else if (!correct) {
      Sound.miss();
    }
    dispatch({ type: "UPDATE_ITEM_RESULT", groupIndex: state.groupIndex, qNo, patch });
  }

  return (
    <div className="screen quiz">
      <div className="quiz-topbar">
        <div className="quiz-progress">{`第 ${state.groupIndex + 1} / ${state.groups.length} 组`}</div>
      </div>

      {group.passage && <PassageBox key={group.groupId} passage={group.passage} />}

      {group.optionBank && (
        <div className="option-bank-box">
          <div className="option-bank-title">词语库 Word Bank</div>
          <div className="option-bank-list">
            {group.optionBank.map((opt) => (
              <div key={opt.key} className="option-bank-item">{`${opt.key}. ${opt.text}`}</div>
            ))}
          </div>
        </div>
      )}

      {group.questions.map((q, idx) => (
        <QuestionCard
          key={q.qNo}
          q={q}
          idx={idx}
          // Position in the whole session, not the question's own qNo (e.g.
          // "Q16") -- that raw number depends on which paper it came from
          // and is meaningless to the student once groups are shuffled.
          displayNo={priorQuestionCount + idx + 1}
          group={group}
          answer={answers[q.qNo]}
          onAnswerChange={(v) => setAnswer(q.qNo, v)}
          item={currentRecord?.items[idx]}
          onSelfCheck={(correct) => handleSelfCheck(q.qNo, q.format, correct)}
        />
      ))}

      <div className="action-row">
        {!state.submitted ? (
          <button className="primary-btn" onClick={handleSubmit}>
            提交本组 Submit This Set
          </button>
        ) : (
          <button className="secondary-btn" onClick={goNext} disabled={hasPendingAi}>
            {hasPendingAi
              ? "🤖 AI 批改中... AI grading in progress..."
              : autoAdvancing
                ? "✓ 全部正确，自动进入下一组... All correct — moving on..."
                : state.groupIndex + 1 < state.groups.length
                  ? "下一组 Next Set"
                  : "查看结果 See Results"}
          </button>
        )}
      </div>
    </div>
  );
}

// Passages can run long, so unlike a question's dictation button (which just
// fires and forgets), this one toggles into a "⏹ Stop" button while reading
// so the student can cut it off mid-passage. `key={group.groupId}` on the
// call site remounts this fresh per group, so `speaking` never needs a
// manual reset when the student moves to a new passage.
function PassageBox({ passage }: { passage: Passage }) {
  const [speaking, setSpeaking] = useState(false);

  function toggle() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      // onDone fires whether the reading finishes on its own or gets
      // interrupted (stopSpeaking() above, Quiz's own stopSpeaking() on
      // submit/group-change, a question's dictation button starting a new
      // reading) -- either way this button's state stays in sync.
      speakText(passage.text, () => setSpeaking(false));
    }
  }

  return (
    <div className="passage-box">
      <div className="passage-head">
        <div className="passage-heading">
          <div className="passage-title">{passage.title}</div>
          {passage.source && <div className="passage-source">{passage.source}</div>}
        </div>
        <button
          type="button"
          className={"dictation-btn" + (speaking ? " dictation-btn-active" : "")}
          title={speaking ? "停止朗读 Stop reading" : "朗读全文 Read aloud"}
          aria-label={speaking ? "停止朗读 Stop reading" : "朗读全文 Read aloud"}
          onClick={toggle}
        >
          {speaking ? "⏹ 停止 Stop" : "🔊"}
        </button>
      </div>
      <div className="passage-text">{passage.text}</div>
    </div>
  );
}

interface QuestionCardProps {
  q: Question;
  idx: number;
  displayNo: number;
  group: QuestionGroup;
  answer: string | undefined;
  onAnswerChange: (v: string) => void;
  item: GroupResultItem | undefined;
  onSelfCheck: (correct: boolean) => void;
}

function QuestionCard({ q, idx, displayNo, group, answer, onAnswerChange, item, onSelfCheck }: QuestionCardProps) {
  return (
    <div className="question-box" id={`q-${idx}`}>
      <div className="question-head">
        {`Q${displayNo}`}
        {group.category === "comprehension" && isSelfCheckFormat(q.format) && (
          <span className="marks-badge">{`${q.marks} 分`}</span>
        )}
        <button
          type="button"
          className="dictation-btn"
          title="朗读题目 Read aloud"
          aria-label="朗读题目 Read aloud"
          onClick={() => speakText(q.text)}
        >
          🔊
        </button>
      </div>
      <div className="question-text">
        <RichText text={q.text} />
      </div>
      {q.context && <div className="question-context">{q.context}</div>}

      {q.format === "MCQ" && (
        <MCQOptions q={q} group={group} answer={answer} onAnswerChange={onAnswerChange} />
      )}
      {q.format === "Fill-in" && (
        <input
          type="text"
          className="fillin-input"
          placeholder="输入答案 Type your answer"
          value={answer ?? ""}
          onChange={(e) => onAnswerChange(e.target.value)}
        />
      )}
      {(q.format === "Long-Answer" || q.format === "Writing-Constrained") && (
        <textarea
          className="longanswer-input"
          rows={3}
          placeholder="写下你的答案（自我批改）Write your answer (self-checked)"
          value={answer ?? ""}
          onChange={(e) => onAnswerChange(e.target.value)}
        />
      )}

      {item && <Feedback q={q} group={group} item={item} onSelfCheck={onSelfCheck} />}
    </div>
  );
}

function MCQOptions({
  q,
  group,
  answer,
  onAnswerChange
}: {
  q: Question & { format: "MCQ" };
  group: QuestionGroup;
  answer: string | undefined;
  onAnswerChange: (v: string) => void;
}) {
  const bank = group.optionBank ?? q.options ?? [];
  const compact = !!group.optionBank;
  return (
    <div className={"options" + (compact ? " options-compact" : "")}>
      {bank.map((opt) => (
        <label key={opt.key} className={"option-label" + (compact ? " option-compact" : "")}>
          <input
            type="radio"
            name={`radio-${q.qNo}`}
            value={opt.key}
            checked={answer === opt.key}
            onChange={() => onAnswerChange(opt.key)}
          />
          <span className="option-text">{compact ? opt.key : `${opt.key}. ${opt.text}`}</span>
        </label>
      ))}
    </div>
  );
}

function Feedback({
  q,
  group,
  item,
  onSelfCheck
}: {
  q: Question;
  group: QuestionGroup;
  item: GroupResultItem;
  onSelfCheck: (correct: boolean) => void;
}) {
  if (q.format === "MCQ") {
    const correctOpt = correctOptionFor(q, group);
    const cls = item.correct ? "correct" : item.skipped ? "skipped" : "incorrect";
    const text = item.skipped
      ? `未作答。正确答案 Not answered. Correct answer: ${correctOpt?.key}. ${correctOpt?.text}`
      : item.correct
        ? "✓ 正确 Correct"
        : `✗ 正确答案 Correct answer: ${correctOpt?.key}. ${correctOpt?.text}`;
    return (
      <div className={`feedback ${cls}`}>
        {text}
        {item.correct && <span className="bp-pop"><BpAmount value={BP_AWARD.MCQ} /></span>}
      </div>
    );
  }

  if (q.format === "Fill-in") {
    const cls = item.correct ? "correct" : item.skipped ? "skipped" : "incorrect";
    const text = item.skipped
      ? `未作答。参考答案 Not answered. Suggested answer: ${q.displayAnswer}`
      : item.correct
        ? "✓ 正确 Correct"
        : `✗ 参考答案 Suggested answer: ${q.displayAnswer}`;
    return (
      <div className={`feedback ${cls}`}>
        {text}
        {item.correct && <span className="bp-pop"><BpAmount value={BP_AWARD["Fill-in"]} /></span>}
      </div>
    );
  }

  // Long-Answer / Writing-Constrained -> self-check against a model answer,
  // unless AI grading (family accounts only, see lib/aiGrading.ts) is in
  // play for this item.
  if (item.aiGrading === "pending") {
    return <div className="feedback ai-pending">🤖 AI 正在批改... AI is grading...</div>;
  }

  // AI grading is final -- no manual override.
  if (item.aiGrading === "done") {
    return (
      <div className="feedback self-check">
        <div className={`feedback ${item.correct ? "correct" : "incorrect"}`}>
          {item.correct ? "✓" : "✗"} AI 评分 AI score: {item.aiScore} / {item.marks}
        </div>
        <div className="model-answer">
          <div className="model-answer-label">
            AI 反馈 AI feedback:
            <button
              type="button"
              className="dictation-btn"
              title="朗读反馈 Read feedback aloud"
              aria-label="朗读反馈 Read feedback aloud"
              onClick={() => item.aiFeedback && speakText(item.aiFeedback)}
            >
              🔊
            </button>
          </div>
          <div className="model-answer-text">{item.aiFeedback}</div>
        </div>
        <div className="model-answer">
          <div className="model-answer-label">参考答案 Model Answer:</div>
          <div className="model-answer-text">{q.displayAnswer}</div>
        </div>
        {item.correct === true && <span className="bp-pop"><BpAmount value={BP_AWARD[q.format]} /></span>}
      </div>
    );
  }

  // A blank answer is already auto-marked wrong by gradeQuestion() -- no
  // point asking the student to click a self-check button for nothing they
  // wrote, so show the same static "not answered" style MCQ/Fill-in use.
  if (item.skipped) {
    return (
      <div className="feedback skipped">
        未作答，已自动判为错误。参考答案 Not answered — automatically marked wrong. Suggested answer: {q.displayAnswer}
      </div>
    );
  }

  // aiGrading is "failed" or undefined (guest, non-family user, or any other
  // failure) -- exactly today's manual self-check markup.
  return (
    <div className="feedback self-check">
      <div className="model-answer">
        <div className="model-answer-label">参考答案 Model Answer:</div>
        <div className="model-answer-text">{q.displayAnswer}</div>
      </div>
      <div className="self-check-row">
        <button
          className={"self-btn self-right" + (item.correct === true ? " self-chosen" : "")}
          onClick={() => onSelfCheck(true)}
        >
          ✓ 我答对了 Got it right
        </button>
        <button
          className={"self-btn self-wrong" + (item.correct === false ? " self-chosen" : "")}
          onClick={() => onSelfCheck(false)}
        >
          ✗ 还需加强 Need more practice
        </button>
      </div>
      {item.correct === true && <span className="bp-pop"><BpAmount value={BP_AWARD[q.format]} /></span>}
    </div>
  );
}
