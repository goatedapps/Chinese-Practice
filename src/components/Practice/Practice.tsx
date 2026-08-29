import { useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "../../state/AppStateContext";
import { CATEGORIES, SUBJECTS, VOCABULARY_CATEGORY_KEYS, fetchQuestionCategory } from "../../data/questions";
import { isCategoryRelevantForLevel } from "../../data/levels";
import type { QuestionGroup } from "../../data/types";
import { selectTypeSessionGroups } from "../../lib/typeSession";
import { loadPendingPracticeSession, savePendingPracticeSession, type PracticeSelectionSignature } from "../../state/pendingPractice";
import { loadHistory } from "../../state/history";
import { isLessonMissionComplete } from "../../lib/stats";
import { shouldNudgeForLesson } from "../../state/lessonFrequency";
import { ConfirmModal } from "../common/Modal";
import { Icon } from "../common/Icons";

// Picker-level grouping of the underlying data categories (CATEGORIES in
// questions.ts) into the buttons shown on this screen -- Hanyu Pinyin,
// Vocabulary, Phrase Meaning, and Correct Usage are one combined "Vocabulary"
// button (toggles all four underlying categories together) since a student
// picking this doesn't think of them as separate types, while every other
// category still gets its own button. The underlying CATEGORIES keys are
// untouched (per-category lessonIds tagging still needs them distinct).
// Each group's `categories` list is filtered down to the current level's
// relevantCategories (data/levels.ts) before use below -- a standalone
// group (e.g. Conjunctions) disappears entirely once filtered to nothing,
// and the combined Vocabulary group drops just its irrelevant members (e.g.
// "phrase" for P2) while staying selectable for the rest.
const TYPE_PICKER_GROUP_DEFS: { key: string; label: string; categories: string[] }[] = [
  { key: "vocabulary", label: "词语运用 Vocabulary", categories: VOCABULARY_CATEGORY_KEYS },
  { key: "conjunction", label: CATEGORIES.conjunction.label, categories: ["conjunction"] },
  { key: "sentence", label: CATEGORIES.sentence.label, categories: ["sentence"] },
  { key: "cloze", label: CATEGORIES.cloze.label, categories: ["cloze"] },
  { key: "errorcorrect", label: CATEGORIES.errorcorrect.label, categories: ["errorcorrect"] },
  { key: "comprehension", label: CATEGORIES.comprehension.label, categories: ["comprehension"] },
  { key: "dialogue", label: CATEGORIES.dialogue.label, categories: ["dialogue"] },
  { key: "practical", label: CATEGORIES.practical.label, categories: ["practical"] }
];

export function Practice() {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const [starting, setStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Non-null while the "you've practiced this a lot lately" nudge modal is
  // showing -- holds the flagged lesson number(s) so the message can name
  // them. See state/lessonFrequency.ts.
  const [nudgeLessons, setNudgeLessons] = useState<number[] | null>(null);
  // Loaded once per visit (this screen fully unmounts/remounts on navigation,
  // see App.tsx's ScreenRouter) -- just enough to know whether to show the
  // "复习一课" mission hint below; self-hides once that mission is done today
  // rather than needing to track whether the student arrived via the mission
  // button specifically.
  const [hist] = useState(() => loadHistory());
  const lessonMissionDone = isLessonMissionComplete(hist);

  // Level-filtered view of TYPE_PICKER_GROUP_DEFS/VOCABULARY_CATEGORY_KEYS
  // (see the defs' comment above) -- recomputed only when the level changes
  // (SET_LEVEL resets the whole screen via RESET_TO_HOME-style state anyway,
  // see AppStateContext.tsx, so this rarely recomputes mid-visit).
  const typePickerGroups = useMemo(
    () =>
      TYPE_PICKER_GROUP_DEFS.map((g) => ({ ...g, categories: g.categories.filter((k) => isCategoryRelevantForLevel(k, state.level)) })).filter(
        (g) => g.categories.length > 0
      ),
    [state.level]
  );
  const vocabularyCategoryKeys = useMemo(
    () => VOCABULARY_CATEGORY_KEYS.filter((k) => isCategoryRelevantForLevel(k, state.level)),
    [state.level]
  );

  // Whether at least one of a group's underlying categories has a question
  // under the given subject -- greyed out/unclickable otherwise (e.g.
  // Vocabulary, Conjunctions, Sentence Completion, Dialogue Completion, and
  // Practical Text don't exist under Higher Chinese). Reads
  // state.categorySubjects (populated at app bootstrap, see App.tsx) rather
  // than a static import, since category/subject availability now comes
  // from the fetched question index.
  function groupApplicable(categories: string[], subject: string): boolean {
    if (subject === "All") return true;
    return categories.some((k) => state.categorySubjects[k]?.has(subject));
  }

  const vocabularySelected = vocabularyCategoryKeys.length > 0 && vocabularyCategoryKeys.every((k) => state.selectedCategories.has(k));

  // How many Vocabulary-category questions exist per lesson under the
  // current subject filter -- lets the lesson grid grey out a lesson with no
  // matching questions. Computed from the lightweight question index
  // (already in state from app bootstrap) rather than fetching full category
  // content -- the index already carries lessonIds/questionCount per group,
  // which is all this needs.
  const lessonCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (let n = 1; n <= state.lessonCount; n++) counts.set(n, 0);
    for (const g of state.questionIndex) {
      if (g.lessonIds.length === 0 || !vocabularyCategoryKeys.includes(g.category)) continue;
      if (state.selectedSubject !== "All" && g.subject !== state.selectedSubject) continue;
      for (const n of g.lessonIds) counts.set(n, (counts.get(n) ?? 0) + g.questionCount);
    }
    return counts;
  }, [state.selectedSubject, state.questionIndex, state.lessonCount, vocabularyCategoryKeys]);

  async function startPractice(reducedBP = false) {
    if (state.selectedCategories.size === 0) {
      alert("请至少选择一种题型 Please choose at least one question type.");
      return;
    }
    if (starting) return;

    // A genuine narrowing away from the "all lessons" default -- only ever
    // applied to Vocabulary's 4 categories, never to conjunction/sentence
    // (whose lessonIds aren't reliably per-lesson, see questions.ts).
    const lessonFiltered = vocabularySelected && state.selectedLessons.size > 0;

    // Nudge toward lesson variety: a lesson practiced on >5 distinct days,
    // revisited again within a week of last touching it, prompts to try a
    // different lesson instead of starting right away. Only applies when
    // exactly one lesson is selected -- picking several lessons together is
    // already a form of variety, so it's never flagged or BP-reduced.
    // Skipped once already acknowledged (reducedBP true means the student
    // clicked "continue anyway" on this same attempt).
    if (!reducedBP && lessonFiltered && state.selectedLessons.size === 1 && shouldNudgeForLesson([...state.selectedLessons][0])) {
      setNudgeLessons([...state.selectedLessons]);
      return;
    }

    setStarting(true);
    setLoadError(null);
    let categoryLists: QuestionGroup[][];
    try {
      categoryLists = await Promise.all([...state.selectedCategories].map((c) => fetchQuestionCategory(c)));
    } catch (err) {
      setLoadError((err as Error).message);
      setStarting(false);
      return;
    }
    setStarting(false);

    const groups = categoryLists.flat().filter((g) => {
      if (state.selectedSubject !== "All" && g.subject !== state.selectedSubject) return false;
      if (lessonFiltered && vocabularyCategoryKeys.includes(g.category)) {
        if (!g.lessonEligible || !g.lessonIds.some((id) => state.selectedLessons.has(id))) return false;
      }
      return true;
    });
    if (groups.length === 0) {
      alert("没有符合条件的题目，请调整选择。 No matching questions, please adjust your selection.");
      return;
    }

    const selectedGroups = typePickerGroups.filter((g) => g.categories.every((k) => state.selectedCategories.has(k)));
    const lessonNums = [...state.selectedLessons].sort((a, b) => a - b);
    const label = selectedGroups
      .map((g) => (lessonFiltered && g.key === "vocabulary" ? `${g.label}（第 ${lessonNums.join("、")} 课）` : g.label))
      .join("、");
    const mode = lessonFiltered ? "lesson" : "type";

    // Resume the exact same question set if this exact selection was started
    // (but not finished) most recently -- see state/pendingPractice.ts's own
    // comment for why. A different selection just means this isn't a resume,
    // so a fresh set is generated (and remembered in turn) as before.
    const signature: PracticeSelectionSignature = {
      subject: state.selectedSubject,
      categories: [...state.selectedCategories].sort(),
      lessons: lessonFiltered ? lessonNums : []
    };
    const pending = loadPendingPracticeSession(signature);
    const sessionGroups = pending ? pending.groups : selectTypeSessionGroups(groups);
    if (!pending) {
      savePendingPracticeSession({ signature, mode, modeLabel: label, groups: sessionGroups, reducedBP });
    }

    dispatch({
      type: "START_QUIZ",
      // Keeps "复习一课 Revise a Lesson" (Today's Mission) and the history
      // dashboard working as before: a session only counts as "lesson" mode
      // when the student actually narrowed Vocabulary to specific lesson(s),
      // not just left it at the "all lessons" default.
      mode,
      modeLabel: (lessonFiltered ? "按课文练习 " : "按题型 ") + label,
      groups: sessionGroups,
      reducedBP
    });
  }

  return (
    <div className="screen picker">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        <span className="back-btn-arrow">←</span>
        <span className="back-btn-label">返回 Back</span>
      </button>
      <h1 className="page-header">
        <Icon name="sparkle" className="page-header-spark" />
        <img className="page-header-icon" src="/icons/practice.png" alt="" />
        练习 Practice
        <Icon name="sparkle" className="page-header-spark" />
      </h1>

      {!lessonMissionDone && (
        <div className="mission-hint-box">
          <img className="mission-hint-icon" src="/icons/todays-mission.png" alt="" />
          <span>To complete today's "Revise a Lesson" mission: select "Vocabulary", pick at least one lesson, then start practice.</span>
        </div>
      )}

      <p className="subtitle">选择题型 Select Question Type</p>
      <div className="subject-row">
        <span className="field-label">科目 Subject:</span>
        {["All", ...SUBJECTS].map((s) => (
          <button
            key={s}
            className={"chip" + (state.selectedSubject === s ? " chip-active" : "")}
            onClick={() => dispatch({ type: "SELECT_SUBJECT", subject: s })}
          >
            {s === "All" ? "全部 All" : s}
          </button>
        ))}
      </div>
      <div className="category-grid">
        {typePickerGroups.map(({ key, label, categories }) => {
          const active = categories.every((k) => state.selectedCategories.has(k));
          const applicable = groupApplicable(categories, state.selectedSubject);
          return (
            <button
              key={key}
              className={"category-btn" + (active ? " category-active" : "") + (!applicable ? " category-disabled" : "")}
              disabled={!applicable}
              onClick={() => dispatch({ type: "TOGGLE_CATEGORY_GROUP", keys: categories })}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="subtitle">
        选择课文 Select Lesson(s)
        {!vocabularySelected && (
          <span className="picker-hint"> — 先选择「词语运用 Vocabulary」 Select "Vocabulary" first</span>
        )}
      </p>
      <div className={"lesson-grid" + (!vocabularySelected ? " lesson-grid-disabled" : "")}>
        <button
          className={"lesson-btn" + (state.selectedLessons.size === 0 ? " lesson-btn-active" : "")}
          disabled={!vocabularySelected}
          onClick={() => dispatch({ type: "SELECT_ALL_LESSONS" })}
        >
          <div className="lesson-btn-num">全部课文</div>
          <div className="lesson-btn-count">All Lessons</div>
        </button>
        {Array.from({ length: state.lessonCount }, (_, i) => i + 1).map((n) => {
          const count = lessonCounts.get(n) ?? 0;
          const active = state.selectedLessons.has(n);
          const disabled = !vocabularySelected || count === 0;
          return (
            <button
              key={n}
              className={"lesson-btn" + (active ? " lesson-btn-active" : "") + (disabled ? " disabled" : "")}
              disabled={disabled}
              onClick={() => dispatch({ type: "TOGGLE_LESSON", lessonNum: n })}
            >
              <div className="lesson-btn-num">{`第 ${n} 课`}</div>
              <div className="lesson-btn-count">{count > 0 ? `${count} 题` : "暂无题目"}</div>
            </button>
          );
        })}
      </div>

      {loadError && <p className="tingxie-error-inline">{loadError}</p>}

      <div className="action-row">
        <button className="primary-btn" disabled={starting} onClick={() => startPractice()}>
          {starting ? "加载中... Loading..." : "开始练习 Start Practice"}
        </button>
      </div>

      {nudgeLessons && (
        <ConfirmModal
          messageLines={[
            `You've practiced lesson ${nudgeLessons.join(", ")} a lot lately — try a different lesson?`,
            "Continuing will only earn half BP this time."
          ]}
          cancelLabel="Pick a different lesson"
          confirmLabel="Continue anyway (50% BP)"
          onCancel={() => setNudgeLessons(null)}
          onConfirm={() => {
            setNudgeLessons(null);
            startPractice(true);
          }}
        />
      )}
    </div>
  );
}
