import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import type { QuestionGroup, GroupResult, GroupResultItem, QuestionIndexEntry } from "../data/types";
import { VOCABULARY_CATEGORY_KEYS } from "../data/questions";
import { isCategoryRelevantForLevel } from "../data/levels";
import { loadSavedLevel } from "./levelPreference";

export type Screen =
  | "home"
  | "practice"
  | "quiz"
  | "result"
  | "owl"
  | "shop"
  | "bag"
  | "play"
  | "tingxie"
  | "story"
  | "auth";

export interface AppState {
  screen: Screen;
  // Which public/content/<level>/ directory question-bank/Tingxie/Story
  // content is fetched from -- see data/levels.ts. Changed only via
  // SET_LEVEL, dispatched by components/common/LevelBar.tsx alongside a
  // matching data/levels.ts setCurrentLevel() call, so the loaders' module-
  // level "which level am I fetching" state and this field never drift
  // apart.
  level: string;
  mode: "lesson" | "type" | null;
  modeLabel: string;
  // Set when the student chose to continue practicing an over-repeated
  // lesson past the LessonSelect/Practice nudge (see state/lessonFrequency.ts)
  // -- halves this session's per-question BP awards in Quiz.tsx.
  reducedBP: boolean;
  groups: QuestionGroup[];
  groupIndex: number;
  results: GroupResult[];
  submitted: boolean;
  selectedSubject: string;
  selectedCategories: Set<string>;
  // Which lessons to restrict the Vocabulary category to on the Practice
  // screen -- empty means "all lessons" (the default/no filter). Only
  // meaningful while Vocabulary's 4 categories are all selected; cleared
  // automatically whenever they're not (see vocabRetained() below).
  selectedLessons: Set<number>;
  // Which toy (ShopItem.id) is being played on the "play" screen -- set by
  // START_PLAY, read by components/Play/PlayGame.tsx. Left stale after
  // leaving "play" (harmless, only ever read while screen === "play").
  playingItemId: string | null;
  // Question-bank metadata, fetched once at app bootstrap (see App.tsx's
  // ScreenRouter) and never refetched -- lives here rather than a separate
  // Context because SELECT_SUBJECT below needs categorySubjects
  // *synchronously inside the reducer*, which only has access to this state,
  // not React Context. questionIndexLoaded gates ScreenRouter's render until
  // the fetch resolves; RESET_TO_HOME preserves all four so navigating home
  // doesn't re-trigger the bootstrap fetch.
  questionIndex: QuestionIndexEntry[];
  categorySubjects: Record<string, Set<string>>;
  lessonCount: number;
  questionIndexLoaded: boolean;
}

const initialState: AppState = {
  screen: "home",
  level: loadSavedLevel(),
  mode: null,
  modeLabel: "",
  reducedBP: false,
  groups: [],
  groupIndex: 0,
  results: [],
  submitted: false,
  selectedSubject: "All",
  selectedCategories: new Set(),
  selectedLessons: new Set(),
  playingItemId: null,
  questionIndex: [],
  categorySubjects: {},
  lessonCount: 0,
  questionIndexLoaded: false
};

export type AppAction =
  | { type: "GO_TO_SCREEN"; screen: Screen }
  | { type: "SET_LEVEL"; level: string }
  | { type: "START_QUIZ"; mode: "lesson" | "type"; modeLabel: string; groups: QuestionGroup[]; reducedBP?: boolean }
  | { type: "SELECT_SUBJECT"; subject: string }
  | { type: "SET_QUESTION_INDEX"; index: QuestionIndexEntry[]; categorySubjects: Record<string, Set<string>>; lessonCount: number }
  | { type: "TOGGLE_CATEGORY"; key: string }
  | { type: "TOGGLE_CATEGORY_GROUP"; keys: string[] }
  | { type: "SET_CATEGORIES"; keys: string[] }
  | { type: "TOGGLE_LESSON"; lessonNum: number }
  | { type: "SELECT_ALL_LESSONS" }
  | { type: "SUBMIT_GROUP"; record: GroupResult }
  | { type: "UPDATE_ITEM_RESULT"; groupIndex: number; qNo: string; patch: Partial<GroupResultItem> }
  | { type: "NEXT_GROUP" }
  | { type: "RESET_TO_HOME" }
  | { type: "START_PLAY"; itemId: string };

// Whether every one of Vocabulary's underlying categories *that are
// relevant for this level* (see data/levels.ts's relevantCategories -- e.g.
// P2 has no "phrase" content, so only pinyin/vocab/usage apply there) is
// still in a candidate selectedCategories set -- used to decide whether
// selectedLessons should survive a categories change, since a lesson filter
// is meaningless (and would sit there stale) once Vocabulary itself isn't
// selected. Filtering by level here matters: checking against the full,
// unfiltered VOCABULARY_CATEGORY_KEYS would never be satisfied on a level
// that doesn't offer every one of those categories, silently wiping
// selectedLessons on every categories change even while the student still
// has every level-relevant Vocabulary category selected.
function vocabRetained(categories: Set<string>, level: string): boolean {
  return VOCABULARY_CATEGORY_KEYS.filter((k) => isCategoryRelevantForLevel(k, level)).every((k) => categories.has(k));
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "GO_TO_SCREEN":
      return { ...state, screen: action.screen };
    // Switching levels invalidates every bootstrap/session/picker field at
    // once (a different level's lessons/categories/subjects don't line up
    // with the previous one's selections) -- resets to initialState wholesale
    // rather than patching individual fields, same reasoning as a fresh app
    // load, just with the new level instead of DEFAULT_LEVEL.
    // questionIndexLoaded lands back at false here, which is what makes
    // App.tsx's bootstrap effect refire and fetch the new level's meta/index.
    case "SET_LEVEL":
      return { ...initialState, level: action.level };
    case "START_QUIZ":
      return {
        ...state,
        mode: action.mode,
        modeLabel: action.modeLabel,
        reducedBP: action.reducedBP ?? false,
        groups: action.groups,
        groupIndex: 0,
        results: [],
        submitted: false,
        screen: "quiz"
      };
    case "SELECT_SUBJECT": {
      // Drop any currently-selected category that doesn't exist for the
      // newly-picked subject (e.g. switching to Higher Chinese while
      // Vocabulary is selected) -- Practice greys those buttons out and
      // makes them unclickable, so a stale selection could otherwise sit
      // there invisibly still counting toward the session.
      const next =
        action.subject === "All"
          ? state.selectedCategories
          : new Set([...state.selectedCategories].filter((k) => state.categorySubjects[k]?.has(action.subject)));
      return {
        ...state,
        selectedSubject: action.subject,
        selectedCategories: next,
        selectedLessons: vocabRetained(next, state.level) ? state.selectedLessons : new Set()
      };
    }
    case "SET_QUESTION_INDEX":
      return {
        ...state,
        questionIndex: action.index,
        categorySubjects: action.categorySubjects,
        lessonCount: action.lessonCount,
        questionIndexLoaded: true
      };
    case "TOGGLE_CATEGORY": {
      const next = new Set(state.selectedCategories);
      if (next.has(action.key)) next.delete(action.key);
      else next.add(action.key);
      return { ...state, selectedCategories: next, selectedLessons: vocabRetained(next, state.level) ? state.selectedLessons : new Set() };
    }
    case "TOGGLE_CATEGORY_GROUP": {
      const next = new Set(state.selectedCategories);
      const allSelected = action.keys.every((k) => next.has(k));
      for (const k of action.keys) {
        if (allSelected) next.delete(k);
        else next.add(k);
      }
      return { ...state, selectedCategories: next, selectedLessons: vocabRetained(next, state.level) ? state.selectedLessons : new Set() };
    }
    case "SET_CATEGORIES": {
      const next = new Set(action.keys);
      return { ...state, selectedCategories: next, selectedLessons: vocabRetained(next, state.level) ? state.selectedLessons : new Set() };
    }
    case "TOGGLE_LESSON": {
      const next = new Set(state.selectedLessons);
      if (next.has(action.lessonNum)) next.delete(action.lessonNum);
      else next.add(action.lessonNum);
      return { ...state, selectedLessons: next };
    }
    case "SELECT_ALL_LESSONS":
      return { ...state, selectedLessons: new Set() };
    case "SUBMIT_GROUP":
      return { ...state, results: [...state.results, action.record], submitted: true };
    // Self-check questions (Long-Answer/Writing-Constrained) are only known
    // correct/incorrect after the student clicks a self-check button, which
    // happens after SUBMIT_GROUP already pushed the record -- this patches
    // that one item in place.
    case "UPDATE_ITEM_RESULT": {
      const results = state.results.map((r, idx) => {
        if (idx !== action.groupIndex) return r;
        return {
          ...r,
          items: r.items.map((it) => (it.qNo === action.qNo ? { ...it, ...action.patch } : it))
        };
      });
      return { ...state, results };
    }
    case "NEXT_GROUP": {
      const groupIndex = state.groupIndex + 1;
      return {
        ...state,
        groupIndex,
        submitted: false,
        screen: groupIndex >= state.groups.length ? "result" : "quiz"
      };
    }
    // Clears in-session quiz state but keeps the picker selections
    // (selectedSubject/selectedCategories/selectedLessons) -- these are the
    // student's own choices, not session state, so backing out of a quiz
    // shouldn't force them to re-pick.
    case "RESET_TO_HOME":
      return {
        ...initialState,
        level: state.level,
        selectedSubject: state.selectedSubject,
        selectedCategories: state.selectedCategories,
        selectedLessons: state.selectedLessons,
        // Bootstrap-loaded question-bank metadata survives a reset too --
        // otherwise every "back to home" click would wipe it and re-trigger
        // App.tsx's bootstrap fetch (and its loading flash) needlessly.
        questionIndex: state.questionIndex,
        categorySubjects: state.categorySubjects,
        lessonCount: state.lessonCount,
        questionIndexLoaded: state.questionIndexLoaded
      };
    case "START_PLAY":
      return { ...state, screen: "play", playingItemId: action.itemId };
    default:
      return state;
  }
}

const AppStateCtx = createContext<AppState | null>(null);
const AppDispatchCtx = createContext<Dispatch<AppAction> | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppStateCtx.Provider value={state}>
      <AppDispatchCtx.Provider value={dispatch}>{children}</AppDispatchCtx.Provider>
    </AppStateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const ctx = useContext(AppDispatchCtx);
  if (!ctx) throw new Error("useAppDispatch must be used within AppStateProvider");
  return ctx;
}
