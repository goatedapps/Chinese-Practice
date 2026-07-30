import { useEffect, useRef, useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppStateContext";
import { usePet } from "../../state/PetContext";
import { BP_AWARD } from "../../data/pet";
import { RichText } from "../../lib/richText";
import { Sound } from "../../lib/sound";
import { speakText, stopSpeaking } from "../../lib/speech";
import { ConfirmModal } from "../common/Modal";
import { gradeGroup, correctOptionFor } from "../../lib/grading";
import type { AnswerMap } from "../../lib/grading";
import type { Question, QuestionGroup, GroupResultItem } from "../../data/types";

export function Quiz() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { pet, awardBP } = usePet();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const group = state.groups[state.groupIndex];

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

  // Defensive fallback matching the old renderQuiz()'s `if (!group) return renderResult()`.
  useEffect(() => {
    if (!group) dispatch({ type: "GO_TO_SCREEN", screen: "result" });
  }, [group, dispatch]);

  if (!group) return null;

  const currentRecord = state.submitted ? state.results[state.groupIndex] : null;
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
    const items = gradeGroup(group, answers);
    let dingCount = 0;
    items.forEach((item, idx) => {
      const q = group.questions[idx];
      if (q.format === "MCQ" || q.format === "Fill-in") {
        if (item.correct) {
          Sound.ding(dingCount++ * 0.14);
          awardBP(BP_AWARD[q.format]);
        } else if (!item.skipped) {
          // Silent on a skipped/unanswered question -- only a genuine wrong
          // answer gets the miss sound.
          Sound.miss();
        }
      }
    });
    dispatch({ type: "SUBMIT_GROUP", record: { groupId: group.groupId, items } });

    // Only skip the manual click when every item graded correct outright --
    // anything wrong/skipped, or a self-check item (correct: null until the
    // student clicks a self-check button), needs their eyes on it first.
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
      awardBP(BP_AWARD[format] ?? 2);
      Sound.ding(0);
    } else if (!correct) {
      Sound.miss();
    }
    dispatch({ type: "UPDATE_ITEM_RESULT", groupIndex: state.groupIndex, qNo, patch });
  }

  function hasProgress(): boolean {
    return state.results.length > 0 || Object.values(answers).some((v) => v.trim().length > 0);
  }

  function handleHomeClick() {
    if (hasProgress()) setShowHomeConfirm(true);
    else dispatch({ type: "RESET_TO_HOME" });
  }

  return (
    <div className="screen quiz">
      <div className="quiz-topbar">
        <div className="quiz-progress">
          {`第 ${state.groupIndex + 1} / ${state.groups.length} 组`}
          <span className="quiz-mode-label">{state.modeLabel}</span>
        </div>
        <div className="quiz-bp-badge">💡 {pet.bp} BP</div>
        <button className="home-btn" onClick={handleHomeClick}>
          🏠 返回主页 Home
        </button>
      </div>

      {group.passage && (
        <div className="passage-box">
          <div className="passage-title">{group.passage.title}</div>
          {group.passage.source && <div className="passage-source">{group.passage.source}</div>}
          <div className="passage-text">{group.passage.text}</div>
        </div>
      )}

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
          <button className="secondary-btn" onClick={goNext}>
            {autoAdvancing
              ? "✓ 全部正确，自动进入下一组... All correct — moving on..."
              : state.groupIndex + 1 < state.groups.length
                ? "下一组 Next Set"
                : "查看结果 See Results"}
          </button>
        )}
      </div>

      {showHomeConfirm && (
        <ConfirmModal
          messageLines={[
            "确定要返回主页吗？本次练习尚未完成，本组进度将不会被保存。",
            "Are you sure you want to return home? This session isn't finished — progress won't be saved."
          ]}
          onConfirm={() => {
            setShowHomeConfirm(false);
            dispatch({ type: "RESET_TO_HOME" });
          }}
          onCancel={() => setShowHomeConfirm(false)}
        />
      )}
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
        <span className="marks-badge">{`${q.marks} 分`}</span>
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
        {item.correct && <span className="bp-pop">+{BP_AWARD.MCQ} BP</span>}
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
        {item.correct && <span className="bp-pop">+{BP_AWARD["Fill-in"]} BP</span>}
      </div>
    );
  }

  // Long-Answer / Writing-Constrained -> self-check against a model answer
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
      {item.correct === true && <span className="bp-pop">+{BP_AWARD[q.format]} BP</span>}
    </div>
  );
}
