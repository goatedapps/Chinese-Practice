// Local state for the Tingxie (听写) dictation-practice mode -- deliberately
// NOT part of the global AppStateContext reducer (the user wants this mode
// fully independent from the Quiz/Result pipeline for now). Mounted once by
// <TingxieProvider> inside Tingxie.tsx; every Tingxie screen reads/dispatches
// through useTingxieState()/useTingxieDispatch() instead of prop drilling.
import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import type { TingxieLessonIndexEntry, TingxieSentence, TingxieVocabItem } from "../../data/types";
import { tingxieSentenceWords, tingxieSentenceChars, buildTingxiePracticeSentenceQueue, type TingxieApplyItem, type TingxiePracticeItem } from "../../data/tingxie";
import { shuffle } from "../../lib/shuffle";

export type TingxieView = "select" | "picker" | "learn" | "apply" | "play" | "practice";
export type TingxieSubTab = "vocab" | "sentence";
export type TingxieSentenceDifficulty = "easy" | "hard";

export interface TingxieActiveContent {
  title: string;
  vocab: TingxieVocabItem[];
  sentences: TingxieSentence[];
  // Uncapped vocab list Apply's queue is built from -- for a single lesson
  // this is just `lesson.vocab` again; for custom review it's the full pool
  // across every selected lesson, unlike `vocab` above which is capped for
  // Learn's flip-card carousel. See data/tingxie.ts's pooledTingxieReview().
  applyVocab: TingxieVocabItem[];
  isCustomReview: boolean;
  // Lesson number for a single-lesson pick (undefined for Custom Review,
  // which pools several lessons) -- lets each activity record a completion
  // against the right lesson, see state/lessonFrequency.ts.
  lessonId?: number;
  // Set when the student chose to continue past the "you've practiced this
  // lesson a lot lately" nudge in LessonSelect.tsx -- halves this visit's
  // BP awards in Learn/Apply/Practice/Play.
  reducedBP?: boolean;
}

export interface TingxieState {
  view: TingxieView;
  subTab: TingxieSubTab;

  lessonIndex: TingxieLessonIndexEntry[] | null;
  loadingIndex: boolean;
  indexError: string | null;

  loadingLesson: boolean;
  lessonError: string | null;

  activeContent: TingxieActiveContent | null;

  // Learn / 学词语
  vocabIndex: number;
  vocabFlipped: boolean;
  vocabFlippedIndices: number[];
  // Whether this lesson visit's "all vocab flipped" BP has already been
  // awarded -- lives here (not a component-local ref) because switching
  // Tingxie's tabs (SET_VIEW) unmounts/remounts <Learn/> without resetting
  // vocab progress, and a ref would reset to false on that remount and
  // re-fire the award the instant the student tabs back in. Only reset by
  // a genuine fresh lesson pick (SELECT_LESSON_SUCCESS) or leaving the
  // lesson entirely (GO_SELECT, via the initialState spread).
  vocabLearnAwarded: boolean;

  // Learn / 学默写 -- chipOrder is a shuffled permutation of indices into
  // tingxieSentenceWords()/tingxieSentenceChars(currentSentence) (picked by
  // sentenceDifficulty); placing them in ascending order (0,1,2,...) is what
  // "correct" means, so no need to store the words/chars twice.
  sentenceIndex: number;
  sentenceDifficulty: TingxieSentenceDifficulty;
  chipOrder: number[];
  placedIndices: number[];
  sentenceResult: "correct" | "incorrect" | null;
  sentenceSolvedIndices: number[];
  sentenceRevealed: boolean;
  // Same reasoning/lifecycle as vocabLearnAwarded above, for the sentence
  // sub-tab's "all sentences solved" BP award.
  sentenceLearnAwarded: boolean;

  // 词语应用 Apply -- queue shrinks from the front on correct, and a miss
  // pushes the current item to the back so it resurfaces later this pass.
  applyQueue: TingxieApplyItem[];
  applyFlipped: boolean;
  applyComplete: boolean;

  // 听写练习 Practice -- same front-shrink/back-requeue queue mechanic as
  // Apply, but the reducer itself swaps in the moxie-phase (sentence) queue
  // once the tingxie-phase (vocab) queue empties, so callers only ever
  // dispatch PRACTICE_START once per visit.
  practiceQueue: TingxiePracticeItem[];
  practicePhase: "tingxie" | "moxie";
  practiceFlipped: boolean;
  practiceComplete: boolean;

  // 自由复习 Custom review picker
  pickerSelectedIds: number[];
  loadingReview: boolean;
  reviewError: string | null;
}

const initialState: TingxieState = {
  view: "select",
  subTab: "vocab",

  lessonIndex: null,
  loadingIndex: false,
  indexError: null,

  loadingLesson: false,
  lessonError: null,

  activeContent: null,

  vocabIndex: 0,
  vocabFlipped: false,
  vocabFlippedIndices: [],
  vocabLearnAwarded: false,

  sentenceIndex: 0,
  sentenceDifficulty: "easy",
  chipOrder: [],
  placedIndices: [],
  sentenceResult: null,
  sentenceSolvedIndices: [],
  sentenceRevealed: false,
  sentenceLearnAwarded: false,

  applyQueue: [],
  applyFlipped: false,
  applyComplete: false,

  practiceQueue: [],
  practicePhase: "tingxie",
  practiceFlipped: false,
  practiceComplete: false,

  pickerSelectedIds: [],
  loadingReview: false,
  reviewError: null
};

function shuffledChipOrder(sentence: TingxieSentence | undefined, difficulty: TingxieSentenceDifficulty): number[] {
  if (!sentence) return [];
  const count = (difficulty === "hard" ? tingxieSentenceChars(sentence) : tingxieSentenceWords(sentence)).length;
  return shuffle(Array.from({ length: count }, (_, i) => i));
}

export type TingxieAction =
  | { type: "SET_VIEW"; view: TingxieView }
  | { type: "GO_SELECT" }
  | { type: "GO_PICKER" }
  | { type: "SET_SUB_TAB"; tab: TingxieSubTab }
  | { type: "LOAD_INDEX_START" }
  | { type: "LOAD_INDEX_SUCCESS"; index: TingxieLessonIndexEntry[] }
  | { type: "LOAD_INDEX_ERROR"; error: string }
  | { type: "SELECT_LESSON_START" }
  | { type: "SELECT_LESSON_SUCCESS"; content: TingxieActiveContent }
  | { type: "SELECT_LESSON_ERROR"; error: string }
  | { type: "VOCAB_FLIP" }
  | { type: "VOCAB_NEXT" }
  | { type: "VOCAB_PREV" }
  | { type: "VOCAB_LEARN_AWARDED" }
  | { type: "SENTENCE_LEARN_AWARDED" }
  | { type: "SET_SENTENCE_DIFFICULTY"; difficulty: TingxieSentenceDifficulty }
  | { type: "SENTENCE_PICK"; idx: number }
  | { type: "SENTENCE_UNPICK"; idx: number }
  | { type: "SENTENCE_RESET" }
  | { type: "SENTENCE_NEXT" }
  | { type: "SENTENCE_PREV" }
  | { type: "SENTENCE_REVEAL" }
  | { type: "APPLY_START"; queue: TingxieApplyItem[] }
  | { type: "APPLY_FLIP" }
  | { type: "APPLY_CORRECT" }
  | { type: "APPLY_MISSED" }
  | { type: "PRACTICE_START"; queue: TingxiePracticeItem[] }
  | { type: "PRACTICE_FLIP" }
  | { type: "PRACTICE_CORRECT" }
  | { type: "PRACTICE_MISSED" }
  | { type: "TOGGLE_PICKER_LESSON"; id: number }
  | { type: "TOGGLE_PICKER_ALL"; allIds: number[] }
  | { type: "CUSTOM_REVIEW_START" }
  | { type: "CUSTOM_REVIEW_SUCCESS"; content: TingxieActiveContent; target: "apply" | "play" | "practice" }
  | { type: "CUSTOM_REVIEW_ERROR"; error: string };

function reducer(state: TingxieState, action: TingxieAction): TingxieState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "GO_SELECT":
      return { ...initialState, lessonIndex: state.lessonIndex };
    case "GO_PICKER":
      return { ...state, view: "picker", pickerSelectedIds: [] };
    case "SET_SUB_TAB":
      return { ...state, subTab: action.tab };

    case "LOAD_INDEX_START":
      return { ...state, loadingIndex: true, indexError: null };
    case "LOAD_INDEX_SUCCESS":
      return { ...state, loadingIndex: false, lessonIndex: action.index };
    case "LOAD_INDEX_ERROR":
      return { ...state, loadingIndex: false, indexError: action.error };

    case "SELECT_LESSON_START":
      return { ...state, loadingLesson: true, lessonError: null };
    case "SELECT_LESSON_SUCCESS": {
      const content = action.content;
      return {
        ...state,
        loadingLesson: false,
        activeContent: content,
        view: "learn",
        subTab: "vocab",
        vocabIndex: 0,
        vocabFlipped: false,
        vocabFlippedIndices: [],
        vocabLearnAwarded: false,
        sentenceIndex: 0,
        sentenceDifficulty: "easy",
        chipOrder: shuffledChipOrder(content.sentences[0], "easy"),
        placedIndices: [],
        sentenceResult: null,
        sentenceSolvedIndices: [],
        sentenceRevealed: false,
        sentenceLearnAwarded: false,
        applyQueue: [],
        applyComplete: false,
        practiceQueue: [],
        practicePhase: "tingxie",
        practiceComplete: false
      };
    }
    case "SELECT_LESSON_ERROR":
      return { ...state, loadingLesson: false, lessonError: action.error };

    case "VOCAB_FLIP": {
      const flipped = !state.vocabFlipped;
      const already = state.vocabFlippedIndices.includes(state.vocabIndex);
      return {
        ...state,
        vocabFlipped: flipped,
        vocabFlippedIndices: flipped && !already ? [...state.vocabFlippedIndices, state.vocabIndex] : state.vocabFlippedIndices
      };
    }
    case "VOCAB_NEXT": {
      const total = state.activeContent?.vocab.length ?? 0;
      if (total === 0) return state;
      return { ...state, vocabIndex: (state.vocabIndex + 1) % total, vocabFlipped: false };
    }
    case "VOCAB_PREV": {
      const total = state.activeContent?.vocab.length ?? 0;
      if (total === 0) return state;
      return { ...state, vocabIndex: (state.vocabIndex - 1 + total) % total, vocabFlipped: false };
    }
    case "VOCAB_LEARN_AWARDED":
      return { ...state, vocabLearnAwarded: true };
    case "SENTENCE_LEARN_AWARDED":
      return { ...state, sentenceLearnAwarded: true };

    // Switching difficulty changes the word/char count the chips are drawn
    // from, so the current sentence's in-progress chips are re-shuffled from
    // scratch -- sentenceSolvedIndices is left alone, since a sentence
    // already solved (in either mode) still counts as solved.
    case "SET_SENTENCE_DIFFICULTY": {
      if (state.sentenceDifficulty === action.difficulty) return state;
      const sentence = state.activeContent?.sentences[state.sentenceIndex];
      return {
        ...state,
        sentenceDifficulty: action.difficulty,
        chipOrder: shuffledChipOrder(sentence, action.difficulty),
        placedIndices: [],
        sentenceResult: null,
        sentenceRevealed: false
      };
    }
    case "SENTENCE_PICK": {
      if (state.sentenceResult !== null) return state;
      if (state.placedIndices.includes(action.idx)) return state;
      const placed = [...state.placedIndices, action.idx];
      if (placed.length < state.chipOrder.length) {
        return { ...state, placedIndices: placed };
      }
      const correct = placed.every((v, i) => v === i);
      return {
        ...state,
        placedIndices: placed,
        sentenceResult: correct ? "correct" : "incorrect",
        sentenceSolvedIndices:
          correct && !state.sentenceSolvedIndices.includes(state.sentenceIndex)
            ? [...state.sentenceSolvedIndices, state.sentenceIndex]
            : state.sentenceSolvedIndices
      };
    }
    // Removes just one placed chip back into the bag (rather than the full
    // SENTENCE_RESET) -- also clears a stale "incorrect" result/reveal, since
    // pulling a wrong chip back out is how a student fixes one block instead
    // of starting over, and the tray is no longer "full" once this happens.
    // Left alone once the sentence is already solved ("correct" is final).
    case "SENTENCE_UNPICK": {
      if (state.sentenceResult === "correct") return state;
      if (!state.placedIndices.includes(action.idx)) return state;
      return {
        ...state,
        placedIndices: state.placedIndices.filter((i) => i !== action.idx),
        sentenceResult: null,
        sentenceRevealed: false
      };
    }
    case "SENTENCE_RESET": {
      const sentence = state.activeContent?.sentences[state.sentenceIndex];
      return { ...state, chipOrder: shuffledChipOrder(sentence, state.sentenceDifficulty), placedIndices: [], sentenceResult: null, sentenceRevealed: false };
    }
    case "SENTENCE_NEXT": {
      const total = state.activeContent?.sentences.length ?? 0;
      if (total === 0) return state;
      const idx = (state.sentenceIndex + 1) % total;
      return {
        ...state,
        sentenceIndex: idx,
        chipOrder: shuffledChipOrder(state.activeContent?.sentences[idx], state.sentenceDifficulty),
        placedIndices: [],
        sentenceResult: null,
        sentenceRevealed: false
      };
    }
    case "SENTENCE_PREV": {
      const total = state.activeContent?.sentences.length ?? 0;
      if (total === 0) return state;
      const idx = (state.sentenceIndex - 1 + total) % total;
      return {
        ...state,
        sentenceIndex: idx,
        chipOrder: shuffledChipOrder(state.activeContent?.sentences[idx], state.sentenceDifficulty),
        placedIndices: [],
        sentenceResult: null,
        sentenceRevealed: false
      };
    }
    case "SENTENCE_REVEAL":
      return { ...state, sentenceRevealed: true };

    case "APPLY_START":
      return { ...state, applyQueue: action.queue, applyFlipped: false, applyComplete: action.queue.length === 0 };
    case "APPLY_FLIP":
      return { ...state, applyFlipped: !state.applyFlipped };
    case "APPLY_CORRECT": {
      if (state.applyQueue.length === 0) return state;
      const rest = state.applyQueue.slice(1);
      return { ...state, applyQueue: rest, applyFlipped: false, applyComplete: rest.length === 0 };
    }
    case "APPLY_MISSED": {
      if (state.applyQueue.length === 0) return state;
      const [head, ...rest] = state.applyQueue;
      return { ...state, applyQueue: [...rest, head], applyFlipped: false };
    }

    case "PRACTICE_START":
      return {
        ...state,
        practiceQueue: action.queue,
        practicePhase: "tingxie",
        practiceFlipped: false,
        practiceComplete: action.queue.length === 0
      };
    case "PRACTICE_FLIP":
      return { ...state, practiceFlipped: !state.practiceFlipped };
    case "PRACTICE_CORRECT": {
      if (state.practiceQueue.length === 0) return state;
      const rest = state.practiceQueue.slice(1);
      if (rest.length > 0) {
        return { ...state, practiceQueue: rest, practiceFlipped: false };
      }
      if (state.practicePhase === "tingxie" && state.activeContent) {
        return {
          ...state,
          practiceQueue: buildTingxiePracticeSentenceQueue(state.activeContent.sentences),
          practicePhase: "moxie",
          practiceFlipped: false
        };
      }
      return { ...state, practiceQueue: [], practiceFlipped: false, practiceComplete: true };
    }
    case "PRACTICE_MISSED": {
      if (state.practiceQueue.length === 0) return state;
      const [head, ...rest] = state.practiceQueue;
      return { ...state, practiceQueue: [...rest, head], practiceFlipped: false };
    }

    case "TOGGLE_PICKER_LESSON": {
      const has = state.pickerSelectedIds.includes(action.id);
      return {
        ...state,
        pickerSelectedIds: has ? state.pickerSelectedIds.filter((id) => id !== action.id) : [...state.pickerSelectedIds, action.id]
      };
    }
    case "TOGGLE_PICKER_ALL": {
      const allSelected = action.allIds.length > 0 && action.allIds.every((id) => state.pickerSelectedIds.includes(id));
      return { ...state, pickerSelectedIds: allSelected ? [] : action.allIds };
    }

    case "CUSTOM_REVIEW_START":
      return { ...state, loadingReview: true, reviewError: null };
    case "CUSTOM_REVIEW_SUCCESS": {
      const content = action.content;
      return {
        ...state,
        loadingReview: false,
        activeContent: content,
        view: action.target,
        applyQueue: [],
        applyComplete: false,
        practiceQueue: [],
        practicePhase: "tingxie",
        practiceComplete: false
      };
    }
    case "CUSTOM_REVIEW_ERROR":
      return { ...state, loadingReview: false, reviewError: action.error };

    default:
      return state;
  }
}

const TingxieStateCtx = createContext<TingxieState | null>(null);
const TingxieDispatchCtx = createContext<Dispatch<TingxieAction> | null>(null);

export function TingxieProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TingxieStateCtx.Provider value={state}>
      <TingxieDispatchCtx.Provider value={dispatch}>{children}</TingxieDispatchCtx.Provider>
    </TingxieStateCtx.Provider>
  );
}

export function useTingxieState(): TingxieState {
  const ctx = useContext(TingxieStateCtx);
  if (!ctx) throw new Error("useTingxieState must be used within TingxieProvider");
  return ctx;
}

export function useTingxieDispatch(): Dispatch<TingxieAction> {
  const ctx = useContext(TingxieDispatchCtx);
  if (!ctx) throw new Error("useTingxieDispatch must be used within TingxieProvider");
  return ctx;
}
